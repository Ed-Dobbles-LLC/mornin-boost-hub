import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, ExternalLink } from "lucide-react";

// cos-service (Railway). The briefing key is read-only and scoped to the
// briefing endpoints — it cannot read, move, or purge mail. Safe in bundled
// browser code; rotate in Railway if it ever needs revoking.
const COS_BASE = "https://cos-service-production-1a3b.up.railway.app";
const BRIEFING_KEY = "7abd736e4f7c9511c1975e185997504e";

interface Item {
  headline: string;
  url: string | null;
  summary: string;
}

interface Edition {
  subject: string;
  date: string | null;
  headlines: Item[];
}

interface Dog {
  src: string;
  caption: string;
}

interface Section {
  masthead: string;
  headline_count: number;
  editions: Edition[];
}

export const BriefingBox = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [total, setTotal] = useState(0);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(3);

  const fetchBriefing = async (windowDays: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${COS_BASE}/api/briefing/data?days=${windowDays}`,
        { headers: { "X-Admin-Key": BRIEFING_KEY } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSections(data.sections || []);
      setTotal(data.total_headlines || 0);
      setDogs((data.dogs && data.dogs.pictures) || []);
    } catch (err) {
      console.error("Briefing fetch failed", err);
      setError("Briefing unavailable");
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing(days);
  }, [days]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="font-serif text-xl text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Daily Briefing
          {!loading && total > 0 && (
            <span className="font-sans text-xs font-normal text-muted-foreground ml-1">
              {total} items
            </span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {[1, 3, 7].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`font-sans text-xs px-2 py-1 rounded transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}d
            </button>
          ))}
          <Button
            onClick={() => fetchBriefing(days)}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            aria-label="Refresh briefing"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading && sections.length === 0 && (
          <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm py-6">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Reading the newsletters…
          </div>
        )}

        {error && (
          <p className="font-sans text-sm text-muted-foreground py-4">{error}</p>
        )}

        {!loading && !error && total === 0 && (
          <p className="font-sans text-sm text-muted-foreground py-4">
            Nothing in the last {days} day{days > 1 ? "s" : ""}. Try a wider window.
          </p>
        )}

        {dogs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-baseline justify-between border-b border-border pb-2 mb-3">
              <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-foreground">
                Dogs
              </h3>
              <span className="font-sans text-[11px] text-muted-foreground">
                {dogs.length}
              </span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {dogs.map((d, i) => (
                <img
                  key={i}
                  src={d.src}
                  alt={d.caption}
                  title={d.caption}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          {sections
            .filter((s) => s.headline_count > 0)
            .map((section) => (
              <div key={section.masthead}>
                <div className="flex items-baseline justify-between border-b border-border pb-2 mb-3">
                  <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-foreground">
                    {section.masthead}
                  </h3>
                  <span className="font-sans text-[11px] text-muted-foreground">
                    {section.headline_count}
                  </span>
                </div>

                <ul className="space-y-3">
                  {section.editions.flatMap((ed) =>
                    ed.headlines.slice(0, 4).map((item, i) => (
                      <li key={`${ed.subject}-${i}`} className="leading-snug">
                        {item.headline ? (
                          item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-sans text-sm text-foreground hover:text-primary transition-colors inline-flex items-start gap-1"
                            >
                              {item.headline}
                              <ExternalLink className="w-3 h-3 mt-1 flex-shrink-0 opacity-50" />
                            </a>
                          ) : (
                            <span className="font-sans text-sm text-foreground">
                              {item.headline}
                            </span>
                          )
                        ) : null}
                        {item.summary && (
                          <p className="font-sans text-xs text-muted-foreground mt-1">
                            {item.summary}
                          </p>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
