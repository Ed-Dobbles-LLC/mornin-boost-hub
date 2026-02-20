import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PROJECTS } from "@/data/projects";
import { MoveRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Live:     "bg-primary/15 text-primary border-primary/30",
  Shipped:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Building: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function Projects() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6 pt-36 pb-8">
        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-primary mb-4">AI Projects</p>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-6">What I'm building</h1>
        <p className="font-sans text-base text-muted-foreground max-w-xl leading-relaxed mb-16">
          Practical AI and analytics systems built to solve real business problems —
          each with a clear problem, a measurable outcome, and a production path.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {PROJECTS.map((project) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="group relative bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />

              <div className="flex flex-wrap gap-2 mb-5">
                {project.tags.map((t) => (
                  <span key={t} className="font-sans text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                    {t}
                  </span>
                ))}
                <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[project.status]}`}>
                  {project.status}
                </span>
              </div>

              <h2 className="font-serif text-2xl text-foreground mb-3">{project.name}</h2>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-1 mb-8">{project.tagline}</p>

              <div className="flex items-center gap-2 text-primary text-sm font-sans font-medium">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  View detail <MoveRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
