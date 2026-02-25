import { Card } from "@/components/ui/card";
import { Target, Mic, Crown, Rocket, ExternalLink } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  status: "live" | "coming-soon";
}

const tools: Tool[] = [
  {
    name: "Job Hunt",
    description: "AI-powered executive job search dashboard",
    url: "https://job-hunt-production-f825.up.railway.app/dashboard",
    icon: <Target size={22} />,
    status: "live",
  },
  {
    name: "Personal Podcasts",
    description: "Intelligence briefings — AI audio platform",
    url: "https://intelligence-briefings-production.up.railway.app/",
    icon: <Mic size={22} />,
    status: "live",
  },
  {
    name: "Chess Coach",
    description: "AI chess analysis and training",
    url: "https://chess-coach-production-b9fb.up.railway.app/",
    icon: <Crown size={22} />,
    status: "live",
  },
];

export const MyTools = () => {
  return (
    <Card className="p-6 shadow-soft border-border/50">
      <div className="flex items-center gap-2 mb-5">
        <Rocket size={18} className="text-primary" />
        <h2 className="font-serif text-xl text-foreground">My Tools</h2>
      </div>
      <div className="space-y-3">
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => window.open(tool.url, "_blank")}
            className="w-full group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-left"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-colors">
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sans font-medium text-sm text-foreground">
                  {tool.name}
                </span>
                {tool.status === "live" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wide bg-emerald-500/15 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                )}
              </div>
              <p className="font-sans text-xs text-muted-foreground mt-0.5 truncate">
                {tool.description}
              </p>
            </div>
            <ExternalLink
              size={14}
              className="flex-shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors"
            />
          </button>
        ))}
      </div>
      <p className="font-sans text-[11px] text-muted-foreground/60 mt-4 text-center">
        More tools coming soon
      </p>
    </Card>
  );
};
