import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LogOut,
  Globe,
  Wine,
  Play,
  FileSearch,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Settings2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

const MIP_API = "https://mip-service-production.up.railway.app";

/* ── Types ── */

interface Market {
  id: string;
  display_name: string;
  state: string;
  estimated_venues: number;
}

interface StageInfo {
  name: string;
  status: "completed" | "in_progress" | "pending" | "failed";
}

interface RunStatus {
  run_id: string;
  status: string;
  mode: string;
  market_id: string;
  progress_pct: number;
  current_stage: string;
  stages_completed: string[];
  stages_remaining: string[];
  cost_so_far: number;
  error?: string;
  // run-level stats
  venues_discovered?: number;
  venues_after_dedup?: number;
  pages_captured?: number;
  cost?: number;
  created_at?: string;
  completed_at?: string;
}

interface RunSummary {
  run_id: string;
  mode: string;
  market_id: string;
  status: string;
  venues_discovered?: number;
  venues_after_dedup?: number;
  pages_captured?: number;
  cost?: number;
  created_at?: string;
  completed_at?: string;
}

interface MarketStats {
  venues: number;
  withMenus: number;
  pages: number;
  cost: number;
  lastRun: string | null;
}

/* ── All known pipeline stages in order ── */
const ALL_CAPTURE_STAGES = [
  "Venue Discovery",
  "Deduplication",
  "Menu Page Detection",
  "Screenshot Capture",
];

const ALL_EXTRACT_STAGES = [
  "OCR Extraction",
  "Brand Matching",
  "Data Aggregation",
];

/* ── Component ── */

export default function MIP() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Markets
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState("");

  // Pipeline status — real polling
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus | null>(null);
  const [stages, setStages] = useState<StageInfo[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Capture button
  const [captureLaunching, setCaptureLaunching] = useState(false);

  // Extract panel
  const [extractOpen, setExtractOpen] = useState(false);
  const [captureRuns, setCaptureRuns] = useState<RunSummary[]>([]);
  const [captureRunsLoading, setCaptureRunsLoading] = useState(false);
  const [selectedCaptureRun, setSelectedCaptureRun] = useState("");
  const [extractBudget, setExtractBudget] = useState("20");
  const [brandCount, setBrandCount] = useState<number | null>(null);
  const [extractLaunching, setExtractLaunching] = useState(false);

  // Market inventory — real data
  const [allRuns, setAllRuns] = useState<RunSummary[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);

  // Data explorer
  const [explorerQuery, setExplorerQuery] = useState("");

  /* ── Load markets ── */
  useEffect(() => {
    fetch(`${MIP_API}/api/markets`)
      .then((r) => r.json())
      .then((data: Market[]) => {
        setMarkets(data);
        if (data.length > 0) setSelectedMarket(data[0].id);
      })
      .catch((err) => {
        console.error("Failed to fetch markets", err);
        toast.error("Failed to load markets");
      })
      .finally(() => setMarketsLoading(false));
  }, []);

  /* ── Load all runs for market inventory ── */
  useEffect(() => {
    setRunsLoading(true);
    fetch(`${MIP_API}/api/runs`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        const runs: RunSummary[] = Array.isArray(data) ? data : data.runs || [];
        setAllRuns(runs);
      })
      .catch((err) => {
        console.error("Failed to fetch runs", err);
        // Not critical — inventory just shows estimates
      })
      .finally(() => setRunsLoading(false));
  }, []);

  /* ── Polling for active run ── */
  const startPolling = useCallback((runId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setActiveRunId(runId);

    const poll = async () => {
      try {
        const res = await fetch(`${MIP_API}/api/runs/${runId}/status`);
        if (!res.ok) return;
        const data: RunStatus = await res.json();
        setRunStatus(data);

        // Build stage list from API response
        const allStages = data.mode === "extract" ? ALL_EXTRACT_STAGES : ALL_CAPTURE_STAGES;
        const completedSet = new Set((data.stages_completed || []).map((s) => s.toLowerCase()));
        const currentLower = (data.current_stage || "").toLowerCase();

        const mapped: StageInfo[] = allStages.map((name) => {
          const lower = name.toLowerCase();
          if (completedSet.has(lower)) return { name, status: "completed" };
          if (lower === currentLower && data.status === "running") return { name, status: "in_progress" };
          if (data.status === "failed" && lower === currentLower) return { name, status: "failed" };
          return { name, status: "pending" };
        });
        setStages(mapped);

        // Stop polling on terminal state
        if (data.status === "completed" || data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          if (data.status === "completed") {
            toast.success(`Run ${runId.slice(0, 8)}… completed`);
            // Refresh runs for inventory
            fetch(`${MIP_API}/api/runs`)
              .then((r) => r.json())
              .then((d) => setAllRuns(Array.isArray(d) ? d : d.runs || []))
              .catch(() => {});
          } else {
            toast.error(`Run failed: ${data.error || "unknown error"}`);
          }
        }
      } catch (err) {
        console.error("Poll error", err);
      }
    };

    // Immediate first poll, then every 10s
    poll();
    pollRef.current = setInterval(poll, 10_000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ── Run Capture ── */
  const handleRunCapture = async () => {
    if (!selectedMarket) return;
    setCaptureLaunching(true);
    try {
      const res = await fetch(`${MIP_API}/api/runs/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market_id: selectedMarket, budget: 10.0 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || err.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const runId = data.run_id;
      toast.success(`Capture started: ${runId.slice(0, 8)}…`);
      startPolling(runId);
    } catch (err: any) {
      toast.error(`Capture failed: ${err.message}`);
    } finally {
      setCaptureLaunching(false);
    }
  };

  /* ── Extract panel: load dependencies ── */
  const openExtractPanel = async () => {
    setExtractOpen(true);
    setCaptureRunsLoading(true);

    // Fetch capture runs for this market
    try {
      const res = await fetch(`${MIP_API}/api/runs?market_id=${selectedMarket}&mode=capture`);
      if (res.ok) {
        const data = await res.json();
        const runs: RunSummary[] = Array.isArray(data) ? data : data.runs || [];
        const completed = runs.filter((r) => r.status === "completed");
        setCaptureRuns(completed);
        if (completed.length > 0) setSelectedCaptureRun(completed[0].run_id);
      }
    } catch (err) {
      console.error("Failed to load capture runs", err);
    } finally {
      setCaptureRunsLoading(false);
    }

    // Check brand config
    try {
      const res = await fetch(`${MIP_API}/api/brands/config`);
      if (res.ok) {
        const data = await res.json();
        const brands = data.brands || [];
        const enabled = brands.filter((b: any) => b.enabled !== false);
        setBrandCount(enabled.length);
      } else {
        setBrandCount(0);
      }
    } catch {
      setBrandCount(0);
    }
  };

  /* ── Run Extract ── */
  const handleRunExtract = async () => {
    if (!selectedMarket || !selectedCaptureRun) return;
    setExtractLaunching(true);
    try {
      const res = await fetch(`${MIP_API}/api/runs/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market_id: selectedMarket,
          capture_run_id: selectedCaptureRun,
          budget: parseFloat(extractBudget) || 20,
          brands_file: "config/brands_active.json",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || err.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const runId = data.run_id;
      toast.success(`Extract started: ${runId.slice(0, 8)}…`);
      setExtractOpen(false);
      startPolling(runId);
    } catch (err: any) {
      toast.error(`Extract failed: ${err.message}`);
    } finally {
      setExtractLaunching(false);
    }
  };

  /* ── Market stats from real runs ── */
  const getMarketStats = (marketId: string): MarketStats | null => {
    const marketRuns = allRuns.filter(
      (r) => r.market_id === marketId && r.mode === "capture" && r.status === "completed"
    );
    if (marketRuns.length === 0) return null;

    // Latest completed run
    const sorted = [...marketRuns].sort((a, b) => {
      const da = a.completed_at || a.created_at || "";
      const db = b.completed_at || b.created_at || "";
      return db.localeCompare(da);
    });
    const latest = sorted[0];

    return {
      venues: latest.venues_discovered || 0,
      withMenus: latest.venues_after_dedup || 0,
      pages: latest.pages_captured || 0,
      cost: latest.cost || 0,
      lastRun: latest.completed_at || latest.created_at || null,
    };
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const selectedMarketObj = markets.find((m) => m.id === selectedMarket);
  const isRunning = runStatus && (runStatus.status === "running" || runStatus.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/hub" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-serif text-lg text-foreground">Dobbles</span>
              <span className="font-serif text-lg text-primary">.AI</span>
            </Link>
            <span className="font-sans text-xs text-muted-foreground ml-3 hidden md:block">/ Menu Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/hub"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Hub
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" /> Site
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page hero */}
      <div className="relative border-b border-border/60 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 50%, hsl(354 64% 59% / 0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-7xl mx-auto px-6 py-8 relative">
          <div className="flex items-center gap-3 mb-1.5">
            <Wine className="w-7 h-7 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Menu Intelligence Pipeline</h1>
          </div>
          <p className="font-sans text-sm text-muted-foreground">
            Brand penetration analysis across restaurant menus
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Row 1: Market Selector + Pipeline Status */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Section 1: Pipeline Control */}
          <Card className="p-6 shadow-soft border-border/50">
            <h2 className="text-xl font-semibold mb-4 text-foreground font-serif">Pipeline Control</h2>

            {marketsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading markets…
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Select Market
                  </label>
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-sans text-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  >
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name} ({m.estimated_venues.toLocaleString()} est. venues)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleRunCapture}
                    disabled={captureLaunching || !selectedMarket}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
                  >
                    {captureLaunching ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Run Capture
                  </Button>
                  <Button
                    onClick={() => (extractOpen ? setExtractOpen(false) : openExtractPanel())}
                    disabled={extractLaunching}
                    variant="outline"
                    className="flex-1 border-primary/40 text-primary hover:bg-primary/10 font-sans font-medium"
                  >
                    <FileSearch className="w-4 h-4 mr-2" />
                    Run Extract
                    {extractOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-1" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    )}
                  </Button>
                </div>

                {/* Extract configuration panel */}
                {extractOpen && (
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        Extract Configuration
                      </span>
                      <button onClick={() => setExtractOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Capture run selector */}
                    <div>
                      <label className="block font-sans text-xs text-muted-foreground mb-1">
                        Capture Run
                      </label>
                      {captureRunsLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground font-sans text-xs py-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Loading runs…
                        </div>
                      ) : captureRuns.length === 0 ? (
                        <p className="font-sans text-xs text-destructive py-1">
                          No completed capture runs for this market. Run a capture first.
                        </p>
                      ) : (
                        <select
                          value={selectedCaptureRun}
                          onChange={(e) => setSelectedCaptureRun(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground font-sans text-xs outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                        >
                          {captureRuns.map((r) => (
                            <option key={r.run_id} value={r.run_id}>
                              {r.run_id.slice(0, 8)}… — {r.venues_discovered || "?"} venues
                              {r.completed_at
                                ? ` — ${new Date(r.completed_at).toLocaleDateString()}`
                                : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block font-sans text-xs text-muted-foreground mb-1">
                        Budget ($)
                      </label>
                      <input
                        type="number"
                        value={extractBudget}
                        onChange={(e) => setExtractBudget(e.target.value)}
                        min="1"
                        step="5"
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground font-sans text-xs outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    {/* Brand config indicator */}
                    <div className="flex items-center gap-2">
                      {brandCount === null ? (
                        <span className="font-sans text-xs text-muted-foreground">Checking brands…</span>
                      ) : brandCount > 0 ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {brandCount} brand{brandCount !== 1 ? "s" : ""} configured
                        </Badge>
                      ) : (
                        <Link to="/mip/brands" className="inline-flex items-center gap-1.5 font-sans text-xs text-destructive hover:underline">
                          <AlertTriangle className="w-3 h-3" />
                          No brands configured — configure first
                        </Link>
                      )}
                    </div>

                    {/* Launch extract */}
                    <Button
                      onClick={handleRunExtract}
                      disabled={extractLaunching || !selectedCaptureRun || captureRuns.length === 0}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium text-sm"
                    >
                      {extractLaunching ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileSearch className="w-4 h-4 mr-2" />
                      )}
                      Start Extraction
                    </Button>
                  </div>
                )}

                <Link to="/mip/brands">
                  <Button
                    variant="outline"
                    className="w-full border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 font-sans font-medium"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Configure Brands
                  </Button>
                </Link>

                {selectedMarketObj && (
                  <div className="mt-2 p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedMarketObj.display_name} · {selectedMarketObj.state}
                    </div>
                    <div className="text-xs font-sans text-muted-foreground mt-1">
                      ~{selectedMarketObj.estimated_venues.toLocaleString()} estimated venues
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Section 2: Pipeline Status — real data */}
          <Card className="p-6 shadow-soft border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground font-serif">Pipeline Status</h2>
              {runStatus ? (
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 uppercase tracking-wider ${
                    runStatus.status === "running"
                      ? "bg-primary/20 text-primary"
                      : runStatus.status === "completed"
                      ? "bg-[#00B98E]/20 text-[#00B98E]"
                      : runStatus.status === "failed"
                      ? "bg-destructive/20 text-destructive"
                      : ""
                  }`}
                >
                  {runStatus.status}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">
                  No Active Run
                </Badge>
              )}
            </div>

            {runStatus ? (
              <div className="space-y-4">
                {/* Run ID + mode */}
                <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                  <span className="font-mono">{runStatus.run_id.slice(0, 12)}…</span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 uppercase">
                    {runStatus.mode}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-sans text-sm text-foreground">
                      {runStatus.current_stage || "Initializing"}
                    </span>
                    <span className="font-sans text-xs text-muted-foreground">
                      {Math.round(runStatus.progress_pct || 0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${runStatus.progress_pct || 0}%`,
                        background:
                          runStatus.status === "failed"
                            ? "hsl(0 84% 60%)"
                            : runStatus.status === "completed"
                            ? "hsl(160 100% 36%)"
                            : "linear-gradient(90deg, hsl(354 64% 59%), hsl(209 63% 42%))",
                      }}
                    />
                  </div>
                </div>

                {/* Stage list */}
                <div className="space-y-2">
                  {stages.map((stage) => (
                    <div
                      key={stage.name}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg"
                      style={{
                        background:
                          stage.status === "in_progress"
                            ? "hsl(354 64% 59% / 0.06)"
                            : stage.status === "failed"
                            ? "hsl(0 84% 60% / 0.06)"
                            : "transparent",
                      }}
                    >
                      {stage.status === "completed" && (
                        <CheckCircle2 className="w-4 h-4 text-[hsl(160,100%,36%)] flex-shrink-0" />
                      )}
                      {stage.status === "in_progress" && (
                        <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                      )}
                      {stage.status === "failed" && (
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                      {stage.status === "pending" && (
                        <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span
                        className={`font-sans text-sm ${
                          stage.status === "completed"
                            ? "text-muted-foreground"
                            : stage.status === "in_progress"
                            ? "text-foreground font-medium"
                            : stage.status === "failed"
                            ? "text-destructive font-medium"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {stage.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-sans text-xs text-muted-foreground">
                    Cost so far: <span className="text-foreground font-medium">${(runStatus.cost_so_far || 0).toFixed(2)}</span>
                  </span>
                </div>

                {/* Error message */}
                {runStatus.error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="font-sans text-xs text-destructive">{runStatus.error}</p>
                  </div>
                )}

                {isRunning && (
                  <p className="font-sans text-[11px] text-muted-foreground/60 italic">
                    Auto-refreshing every 10s
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Circle className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="font-sans text-sm text-muted-foreground">
                  No active pipeline run. Use Pipeline Control to start a capture or extraction.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Section 3: Market Inventory — real data */}
        <Card className="p-6 shadow-soft border-border/50">
          <h2 className="text-xl font-semibold mb-4 text-foreground font-serif">Market Inventory</h2>

          {marketsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {markets.map((market) => {
                const stats = getMarketStats(market.id);

                return (
                  <div
                    key={market.id}
                    className={`p-4 rounded-lg border transition-all ${
                      market.id === selectedMarket
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                    } cursor-pointer`}
                    onClick={() => setSelectedMarket(market.id)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-sans font-medium text-sm text-foreground truncate">
                        {market.display_name}
                      </span>
                    </div>
                    {stats ? (
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <Stat label="Discovered" value={stats.venues.toLocaleString()} />
                        <Stat label="Deduped" value={stats.withMenus.toLocaleString()} />
                        <Stat label="Pages" value={stats.pages.toLocaleString()} />
                        <Stat
                          label="Cost"
                          value={`$${stats.cost.toFixed(2)}`}
                          icon={<DollarSign className="w-3 h-3" />}
                        />
                        <Stat
                          label="Last Run"
                          value={
                            stats.lastRun
                              ? new Date(stats.lastRun).toLocaleDateString()
                              : "—"
                          }
                          icon={<Calendar className="w-3 h-3" />}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <Stat label="Est. Venues" value={market.estimated_venues.toLocaleString()} />
                        <div className="col-span-2">
                          <span className="font-sans text-xs text-muted-foreground/50 italic">
                            No data yet
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Section 4: Data Explorer */}
        <Card className="p-6 shadow-soft border-border/50">
          <h2 className="text-xl font-semibold mb-4 text-foreground font-serif">Data Explorer</h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  value={explorerQuery}
                  onChange={(e) => setExplorerQuery(e.target.value)}
                  placeholder="Ask a question about the data..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground font-sans text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") toast.info("Data Explorer coming soon");
                  }}
                />
              </div>
              <Button
                onClick={() => toast.info("Data Explorer coming soon")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
              >
                <Search className="w-4 h-4 mr-2" />
                Ask
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-border/30">
              <p className="font-sans text-sm text-muted-foreground">
                Data Explorer coming soon — will support questions like{" "}
                <span className="text-foreground italic">"Which DC venues carry Angel's Envy?"</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="font-sans text-xs text-muted-foreground">
            Dobbles.AI · Menu Intelligence Pipeline
          </p>
          <Link to="/hub" className="font-sans text-xs text-muted-foreground hover:text-primary transition-colors">
            Back to Hub →
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* Small stat display used in market cards */
function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-sans text-[11px] text-muted-foreground/70 uppercase tracking-wider">{label}</div>
      <div className="font-sans text-sm font-medium text-foreground flex items-center gap-1">
        {icon}
        {value}
      </div>
    </div>
  );
}
