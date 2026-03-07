import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LogOut,
  Globe,
  Wine,
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ExternalLink,
  Eye,
  Save,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

const MIP_API = "https://mip-service-production.up.railway.app";

// Brand color palette — cycles for each brand added
const BRAND_COLORS = ["#DB5461", "#00B98E", "#85E4FD", "#3273DB", "#FFB347"];

interface Variant {
  name: string;
  checked: boolean;
}

interface BrandConfig {
  name: string;
  enabled: boolean;
  variants: Variant[];
  aliases: string[];
  customVariants: string[];
  expanded: boolean;
}

interface RescanMatch {
  venue_name: string;
  address: string;
  brand_variant: string;
  surrounding_text: string;
  menu_url?: string;
}

export default function MIPBrands() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Step 1: Brand input
  const [brandInput, setBrandInput] = useState("");
  const [discovering, setDiscovering] = useState(false);

  // Step 2: Brand configs
  const [brands, setBrands] = useState<BrandConfig[]>([]);

  // Step 3: Save + Rescan
  const [saving, setSaving] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [rescanResults, setRescanResults] = useState<RescanMatch[] | null>(null);
  const [rescanCount, setRescanCount] = useState(0);

  // Custom variant input per brand
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({});

  // Load saved config on mount
  useEffect(() => {
    fetch(`${MIP_API}/api/brands/config`)
      .then((r) => {
        if (!r.ok) throw new Error("No saved config");
        return r.json();
      })
      .then((data) => {
        if (data.brands && Array.isArray(data.brands)) {
          setBrands(
            data.brands.map((b: any) => ({
              name: b.name,
              enabled: b.enabled ?? true,
              variants: (b.variants || []).map((v: any) => ({
                name: typeof v === "string" ? v : v.name,
                checked: typeof v === "string" ? true : (v.checked ?? true),
              })),
              aliases: b.aliases || [],
              customVariants: b.customVariants || [],
              expanded: false,
            }))
          );
        }
      })
      .catch(() => {
        // No saved config — that's fine
      });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Step 1: Discover variants
  const discoverVariants = useCallback(async () => {
    const name = brandInput.trim();
    if (!name) return;

    // Check if brand already added
    if (brands.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`"${name}" is already in your brand list`);
      return;
    }

    setDiscovering(true);
    try {
      const res = await fetch(`${MIP_API}/api/brands/discover-variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_name: name }),
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();

      const newBrand: BrandConfig = {
        name: data.brand_name || name,
        enabled: true,
        variants: (data.variants || []).map((v: string) => ({ name: v, checked: true })),
        aliases: data.aliases || [],
        customVariants: [],
        expanded: true,
      };

      setBrands((prev) => [...prev, newBrand]);
      setBrandInput("");
      toast.success(`Discovered ${newBrand.variants.length} variants for ${newBrand.name}`);
    } catch (err) {
      console.error("Variant discovery failed", err);
      toast.error("Failed to discover variants. Check the API connection.");
    } finally {
      setDiscovering(false);
    }
  }, [brandInput, brands]);

  // Step 2: Toggle helpers
  const toggleBrandEnabled = (idx: number) => {
    setBrands((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const toggleExpanded = (idx: number) => {
    setBrands((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, expanded: !b.expanded } : b))
    );
  };

  const toggleVariant = (brandIdx: number, variantIdx: number) => {
    setBrands((prev) =>
      prev.map((b, i) =>
        i === brandIdx
          ? {
              ...b,
              variants: b.variants.map((v, vi) =>
                vi === variantIdx ? { ...v, checked: !v.checked } : v
              ),
            }
          : b
      )
    );
  };

  const selectAll = (idx: number) => {
    setBrands((prev) =>
      prev.map((b, i) =>
        i === idx ? { ...b, variants: b.variants.map((v) => ({ ...v, checked: true })) } : b
      )
    );
  };

  const deselectAll = (idx: number) => {
    setBrands((prev) =>
      prev.map((b, i) =>
        i === idx ? { ...b, variants: b.variants.map((v) => ({ ...v, checked: false })) } : b
      )
    );
  };

  const addCustomVariant = (idx: number) => {
    const text = (customInputs[idx] || "").trim();
    if (!text) return;

    setBrands((prev) =>
      prev.map((b, i) =>
        i === idx
          ? {
              ...b,
              variants: [...b.variants, { name: text, checked: true }],
              customVariants: [...b.customVariants, text],
            }
          : b
      )
    );
    setCustomInputs((prev) => ({ ...prev, [idx]: "" }));
  };

  const removeBrand = (idx: number) => {
    setBrands((prev) => prev.filter((_, i) => i !== idx));
  };

  // Step 3: Save config
  const saveConfig = async () => {
    setSaving(true);
    try {
      const payload = {
        brands: brands.map((b) => ({
          name: b.name,
          enabled: b.enabled,
          variants: b.variants.map((v) => ({ name: v.name, checked: v.checked })),
          aliases: b.aliases,
          customVariants: b.customVariants,
        })),
      };

      const res = await fetch(`${MIP_API}/api/brands/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      toast.success("Brand configuration saved");
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save brand configuration");
    } finally {
      setSaving(false);
    }
  };

  // Step 3: Rescan
  const rescanData = async () => {
    setRescanning(true);
    setRescanResults(null);
    try {
      const enabledVariants = brands
        .filter((b) => b.enabled)
        .flatMap((b) => b.variants.filter((v) => v.checked).map((v) => v.name));

      const res = await fetch(`${MIP_API}/api/brands/rescan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          run_id: "latest",
          variant_names: enabledVariants,
        }),
      });

      if (!res.ok) throw new Error(`Rescan failed: ${res.status}`);
      const data = await res.json();

      setRescanResults(data.matches || []);
      setRescanCount(data.total_new_mentions || data.matches?.length || 0);
      toast.success(`Rescan complete — ${data.total_new_mentions || 0} new mentions found`);
    } catch (err) {
      console.error("Rescan failed", err);
      toast.error("Rescan failed. Check API connection.");
    } finally {
      setRescanning(false);
    }
  };

  // Build Chrome text fragment URL
  const buildFragmentUrl = (menuUrl: string, variant: string) => {
    const encoded = encodeURIComponent(variant).replace(/%20/g, "%20");
    return `${menuUrl}#:~:text=${encoded}`;
  };

  const buildAllFragmentsUrl = (menuUrl: string) => {
    const enabledVariants = brands
      .filter((b) => b.enabled)
      .flatMap((b) => b.variants.filter((v) => v.checked).map((v) => v.name));
    const fragments = enabledVariants
      .slice(0, 10) // Chrome has a practical limit
      .map((v) => `text=${encodeURIComponent(v)}`)
      .join("&");
    return `${menuUrl}#:~:${fragments}`;
  };

  const getBrandColor = (idx: number) => BRAND_COLORS[idx % BRAND_COLORS.length];

  const enabledVariantCount = brands
    .filter((b) => b.enabled)
    .reduce((sum, b) => sum + b.variants.filter((v) => v.checked).length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header — matches MIP page exactly */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/hub" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-serif text-lg text-foreground">Dobbles</span>
              <span className="font-serif text-lg text-primary">.AI</span>
            </Link>
            <span className="font-sans text-xs text-muted-foreground ml-3 hidden md:block">
              / <Link to="/mip" className="hover:text-foreground transition-colors">Menu Intelligence</Link> / Brands
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/mip"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Pipeline
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

      {/* Hero */}
      <div className="relative border-b border-border/60 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 50%, hsl(354 64% 59% / 0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-7xl mx-auto px-6 py-8 relative">
          <div className="flex items-center gap-3 mb-1.5">
            <Wine className="w-7 h-7 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Brand Configuration</h1>
          </div>
          <p className="font-sans text-sm text-muted-foreground">
            Define target brands, discover variants, and configure extraction matching
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Step 1: Add Brands */}
        <Card className="p-6 shadow-soft border-border/50">
          <h2 className="text-xl font-semibold mb-4 text-foreground font-serif">Add Brands</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type="text"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                placeholder="Enter a brand name (e.g. WhistlePig, Angel's Envy)"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground font-sans text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !discovering) discoverVariants();
                }}
                disabled={discovering}
              />
            </div>
            <Button
              onClick={discoverVariants}
              disabled={discovering || !brandInput.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium whitespace-nowrap"
            >
              {discovering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Discovering…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Discover Variants
                </>
              )}
            </Button>
          </div>
          {brands.length > 0 && (
            <p className="font-sans text-xs text-muted-foreground mt-3">
              {brands.length} brand{brands.length !== 1 ? "s" : ""} configured · {enabledVariantCount} active variant{enabledVariantCount !== 1 ? "s" : ""}
            </p>
          )}
        </Card>

        {/* Step 2: Brand Cards */}
        {brands.length > 0 && (
          <div className="space-y-4">
            {brands.map((brand, brandIdx) => {
              const color = getBrandColor(brandIdx);
              const checkedCount = brand.variants.filter((v) => v.checked).length;

              return (
                <Card
                  key={`${brand.name}-${brandIdx}`}
                  className="shadow-soft border-border/50 overflow-hidden"
                  style={{ borderLeftWidth: 4, borderLeftColor: color }}
                >
                  {/* Brand header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                    onClick={() => toggleExpanded(brandIdx)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-sans font-semibold text-foreground">{brand.name}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 uppercase tracking-wider"
                      >
                        {checkedCount}/{brand.variants.length} variants
                      </Badge>
                      {brand.aliases.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 uppercase tracking-wider"
                        >
                          {brand.aliases.length} alias{brand.aliases.length !== 1 ? "es" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="font-sans text-xs text-muted-foreground">
                          {brand.enabled ? "Enabled" : "Disabled"}
                        </span>
                        <Switch
                          checked={brand.enabled}
                          onCheckedChange={() => toggleBrandEnabled(brandIdx)}
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBrand(brandIdx);
                        }}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {brand.expanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {brand.expanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                      {/* Select all / Deselect all */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAll(brandIdx)}
                          className="font-sans text-xs"
                        >
                          <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deselectAll(brandIdx)}
                          className="font-sans text-xs"
                        >
                          <Square className="w-3.5 h-3.5 mr-1.5" />
                          Deselect All
                        </Button>
                      </div>

                      {/* Variants checklist */}
                      <div>
                        <label className="block font-sans text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                          Variants
                        </label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {brand.variants.map((variant, vIdx) => (
                            <label
                              key={`${variant.name}-${vIdx}`}
                              className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                variant.checked
                                  ? "border-primary/30 bg-primary/5"
                                  : "border-border/30 bg-background/30 opacity-60"
                              }`}
                            >
                              <Checkbox
                                checked={variant.checked}
                                onCheckedChange={() => toggleVariant(brandIdx, vIdx)}
                              />
                              <span className="font-sans text-sm text-foreground truncate">
                                {variant.name}
                              </span>
                              {brand.customVariants.includes(variant.name) && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1 py-0 uppercase ml-auto flex-shrink-0"
                                >
                                  Custom
                                </Badge>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Aliases */}
                      {brand.aliases.length > 0 && (
                        <div>
                          <label className="block font-sans text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                            Aliases (alternate spellings)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {brand.aliases.map((alias, aIdx) => (
                              <span
                                key={aIdx}
                                className="font-sans text-xs px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground bg-background/50"
                              >
                                {alias}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add custom variant */}
                      <div>
                        <label className="block font-sans text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                          Add Custom Variant
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customInputs[brandIdx] || ""}
                            onChange={(e) =>
                              setCustomInputs((prev) => ({ ...prev, [brandIdx]: e.target.value }))
                            }
                            placeholder="e.g. WhistlePig Piggyback"
                            className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-foreground font-sans text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addCustomVariant(brandIdx);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomVariant(brandIdx)}
                            className="font-sans"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Step 3: Save + Rescan */}
        {brands.length > 0 && (
          <Card className="p-6 shadow-soft border-border/50">
            <h2 className="text-xl font-semibold mb-4 text-foreground font-serif">Save & Rescan</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={saveConfig}
                  disabled={saving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Brand Config
                </Button>
                <Button
                  onClick={rescanData}
                  disabled={rescanning || enabledVariantCount === 0}
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 font-sans font-medium"
                >
                  {rescanning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Rescan Captured Data
                </Button>
              </div>

              {rescanning && (
                <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning menu data for {enabledVariantCount} variant{enabledVariantCount !== 1 ? "s" : ""}…
                </div>
              )}

              {rescanResults !== null && !rescanning && (
                <div className="p-4 rounded-lg border border-border/30 bg-background/50">
                  <p className="font-sans text-sm text-foreground font-medium">
                    Found{" "}
                    <span className="text-[#00B98E]">{rescanCount}</span>{" "}
                    additional brand mention{rescanCount !== 1 ? "s" : ""} in captured menu data
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 4: Verification Results */}
        {rescanResults && rescanResults.length > 0 && (
          <Card className="p-6 shadow-soft border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground font-serif">Verification Results</h2>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">
                {rescanResults.length} match{rescanResults.length !== 1 ? "es" : ""}
              </Badge>
            </div>

            <div className="space-y-3">
              {rescanResults.map((match, mIdx) => {
                // Find which brand this variant belongs to for color-coding
                const brandIdx = brands.findIndex((b) =>
                  b.variants.some((v) => v.name === match.brand_variant)
                );
                const matchColor = brandIdx >= 0 ? getBrandColor(brandIdx) : "#85E4FD";

                return (
                  <div
                    key={mIdx}
                    className="p-4 rounded-lg border border-border/30 bg-background/30 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-sans font-medium text-sm text-foreground">
                          {match.venue_name}
                        </p>
                        {match.address && (
                          <p className="font-sans text-xs text-muted-foreground">{match.address}</p>
                        )}
                      </div>
                      <Badge
                        className="text-[10px] px-2 py-0.5 uppercase tracking-wider flex-shrink-0 text-white"
                        style={{ backgroundColor: matchColor }}
                      >
                        {match.brand_variant}
                      </Badge>
                    </div>

                    {/* Surrounding text with variant highlighted */}
                    {match.surrounding_text && (
                      <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                        {highlightVariant(match.surrounding_text, match.brand_variant, matchColor)}
                      </p>
                    )}

                    {/* Action buttons */}
                    {match.menu_url && (
                      <div className="flex gap-2 pt-1">
                        <a
                          href={buildFragmentUrl(match.menu_url, match.brand_variant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-sans text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Menu Page
                        </a>
                        <a
                          href={buildAllFragmentsUrl(match.menu_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View All Brands
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Empty state */}
        {brands.length === 0 && (
          <div className="text-center py-16">
            <Wine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-sans text-sm text-muted-foreground">
              No brands configured yet. Add a brand above to discover its variants.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="font-sans text-xs text-muted-foreground">
            Dobbles.AI · Brand Configuration
          </p>
          <Link to="/mip" className="font-sans text-xs text-muted-foreground hover:text-primary transition-colors">
            Back to Pipeline →
          </Link>
        </div>
      </footer>
    </div>
  );
}

/**
 * Highlight a variant name within surrounding text, returning JSX with the
 * matched substring wrapped in a styled <mark>.
 */
function highlightVariant(text: string, variant: string, color: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(variant.toLowerCase());
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + variant.length);
  const after = text.slice(idx + variant.length);

  return (
    <>
      {before}
      <mark
        className="rounded px-0.5 font-medium text-foreground"
        style={{ backgroundColor: `${color}33` }}
      >
        {match}
      </mark>
      {after}
    </>
  );
}
