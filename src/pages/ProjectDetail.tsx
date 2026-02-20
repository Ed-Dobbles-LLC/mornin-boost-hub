import { useParams, Link, Navigate } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PROJECTS } from "@/data/projects";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Live: "bg-primary/15 text-primary border-primary/30",
  Shipped: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Building: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) return <Navigate to="/projects" replace />;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> All Projects
        </Link>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((t) => (
            <span key={t} className="font-sans text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
              {t}
            </span>
          ))}
          <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[project.status]}`}>
            {project.status}
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-4">{project.name}</h1>
        <p className="font-sans text-xl text-muted-foreground max-w-xl leading-relaxed mb-16">{project.tagline}</p>

        <div className="grid md:grid-cols-[1fr_320px] gap-16 items-start">
          {/* Main content */}
          <div className="space-y-12">
            {[
              { label: "The Problem", body: project.problem },
              { label: "Users", body: project.users },
              { label: "Approach", body: project.approach },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-sans text-xs font-semibold tracking-widest uppercase text-primary mb-4">{s.label}</p>
                <p className="font-sans text-base text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}

            <div>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-primary mb-4">Outcomes</p>
              <ul className="space-y-0">
                {project.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-3 py-4 border-b border-border font-sans text-base text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sticky top-24">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-primary mb-4">Roadmap</p>
              <ul className="space-y-0">
                {project.roadmap.map((r, i) => (
                  <li key={i} className="flex items-start gap-4 py-3.5 border-b border-border last:border-0 font-sans text-sm text-muted-foreground">
                    <span className="font-mono text-xs text-primary font-bold flex-shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-primary mb-3">Interested?</p>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-5">
                Reach out to discuss this project, collaboration, or how this approach could apply to your business.
              </p>
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Talk to me about this <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
