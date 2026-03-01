import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Mic,
  Crown,
  BarChart3,
  ExternalLink,
  BookOpen,
  DollarSign,
  Building2,
} from "lucide-react";

interface Tool {
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  status: "live" | "building";
}

const tools: Tool[] = [
  {
    name: "Job Hunt",
    description: "Job search tracking & pipeline",
    url: "https://job-hunt-production-f825.up.railway.app/dashboard",
    icon: <Briefcase size={22} />,
    status: "live",
  },
  {
    name: "Personal Podcasts",
    description: "Podcast management & analytics",
    url: "https://personal-podcasts-production.up.railway.app",
    icon: <Mic size={22} />,
    status: "live",
  },
  {
    name: "Chess Coach",
    description: "Chess training & game analysis",
    url: "https://chess-coach-production.up.railway.app",
    icon: <Crown size={22} />,
    status: "live",
  },
  {
    name: "AR Intel",
    description: "AnswerRocket positioning & content analysis",
    url: "https://ar-intelligence-dashboard-production.up.railway.app",
    icon: <BarChart3 size={22} />,
    status: "live",
  },
  {
    name: "Blog Reader",
    description: "Blog ingestion & content analysis",
    url: "https://github.com/Ed-Dobbles-LLC/blog-reader",
    icon: <BookOpen size={22} />,
    status: "live",
  },
  {
    name: "Cost Tracker",
    description: "AI spend tracking & optimization",
    url: "https://github.com/Ed-Dobbles-LLC/cost-tracker",
    icon: <DollarSign size={22} />,
    status: "live",
  },
  {
    name: "Company Researcher",
    description: "Automated company intelligence",
    url: "https://github.com/Ed-Dobbles-LLC/company-researcher",
    icon: <Building2 size={22} />,
    status: "live",
  },
];

export const MyTools = () => {
  return (
    <Card className="p-6 shadow-soft border-border/50">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">My Tools</h2>
      <div className="space-y-3">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/40 hover:shadow-soft transition-all duration-200 group"
          >
            <div className="flex-shrink-0 text-primary">{tool.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sans font-medium text-foreground text-sm">
                  {tool.name}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 uppercase tracking-wider"
                >
                  {tool.status}
                </Badge>
              </div>
              <p className="font-sans text-xs text-muted-foreground mt-0.5 truncate">
                {tool.description}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </Card>
  );
};
