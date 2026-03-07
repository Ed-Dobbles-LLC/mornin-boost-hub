import { useState, useEffect } from "react";
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
  FileText,
  Calendar,
  Settings2,
} from "lucide-react";

const MIP_API = "https://mip-service-production.up.railway.app";

interface Market {
  id: string;
  display_name: string;
  state: string;
  estimated_venues: number;
}

// Mock pipeline stages for the status section
const MOCK_STAGES = [
  { name: "Venue Discovery", status: "completed" as const },
  { name: "Menu Page Detection", status: "completed" as const },
  { name: "Screenshot Capture", status: "in_progress" as const },
  { name: "OCR Extraction", status: "pending" as const },
  { name: "Brand Matching", status: "pending" as const },
  { name: "Data Aggregation", status: "pending" as const },
];

// Mock market stats
function mockStats(market: Market) {
  const base = market.estimated_venues;
  return {
    totalVenues: base,
    withMenus: Math.round(base * 0.38),
    pagesCaptured: Math.round(base * 0.38 * 2.4),
    lastRun: null as string | null,
  };
}

export default function MIP() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [explorerQuery, setExplorerQuery] = useState("");

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const selectedMarketObj = markets.find((m) => m.id === selectedMarket);

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
          {/* Section 1: Market Selector + Pipeline Trigger */}
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
                    onClick={() => toast.info("Capture pipeline coming soon")}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Capture
                  </Button>
                  <Button
                    onClick={() => toast.info("Extract pipeline coming soon")}
                    variant="outline"
                    className="flex-1 border-primary/40 text-primary hover:bg-primary/10 font-sans font-medium"
                  >
                    <FileSearch className="w-4 h-4 mr-2" />
                    Run Extract
                  </Button>
                </div>

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

          {/* Section 2: Pipeline Status */}
          <Card className="p-6 shadow-soft border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground font-serif">Pipeline Status</h2>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">
                Mock Data
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-sans text-sm text-foreground">Screenshot Capture</span>
                  <span className="font-sans text-xs text-muted-foreground">42%</span>
                </div>
                <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: "42%",
                      background: "linear-gradient(90deg, hsl(354 64% 59%), hsl(209 63% 42%))",
                    }}
                  />
                </div>
              </div>

              {/* Stage list */}
              <div className="space-y-2">
                {MOCK_STAGES.map((stage) => (
                  <div
                    key={stage.name}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{
                      background:
                        stage.status === "in_progress" ? "hsl(354 64% 59% / 0.06)" : "transparent",
                    }}
                  >
                    {stage.status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 text-[hsl(160,100%,36%)] flex-shrink-0" />
                    )}
                    {stage.status === "in_progress" && (
                      <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
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
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>

              <p className="font-sans text-[11px] text-muted-foreground/60 italic">
                Auto-refresh every 10s when a run is active. Status API pending.
              </p>
            </div>
          </Card>
        </div>

        {/* Section 3: Market Inventory */}
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
                const stats = mockStats(market);
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
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <Stat label="Venues" value={stats.totalVenues.toLocaleString()} />
                      <Stat label="With Menus" value={stats.withMenus.toLocaleString()} />
                      <Stat label="Pages" value={stats.pagesCaptured.toLocaleString()} />
                      <Stat
                        label="Last Run"
                        value={stats.lastRun ?? "—"}
                        icon={<Calendar className="w-3 h-3" />}
                      />
                    </div>
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
