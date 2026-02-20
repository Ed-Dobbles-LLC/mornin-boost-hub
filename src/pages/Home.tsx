import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MoveRight } from "lucide-react";
import { PROJECTS } from "@/data/projects";

const PROOF = [
  { value: "$300M+", label: "Enterprise value created" },
  { value: "25+",    label: "Years in analytics leadership" },
  { value: "60 FTE", label: "Largest team led · $17M budget" },
  { value: "4",      label: "AI products in production" },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Strategy before dashboards",
    body: "Data without decision rights is decoration. I start with what needs to change, then build the measurement system around it.",
  },
  {
    n: "02",
    title: "Geek that can Speak",
    body: "Technical depth without translation is wasted. I close the gap between data teams and board rooms — every brief, every meeting.",
  },
  {
    n: "03",
    title: "Prototype, measure, scale",
    body: "Speed of learning beats perfection of planning. I bias toward working product over polished decks.",
  },
  {
    n: "04",
    title: "Culture is the moat",
    body: "Analytics capability built into people outlasts any platform. Team engagement doubled at H&R Block because the work mattered.",
  },
];

const STATUS_COLORS: Record<string, string> = {
  Live:     "bg-primary/15 text-primary border-primary/30",
  Shipped:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Building: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-28 px-6 max-w-6xl mx-auto overflow-hidden">
        {/* BG orb */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(0 65% 55% / 0.08) 0%, transparent 70%)" }}
        />

        <div className="relative">
          <p className="flex items-center gap-3 text-xs font-sans font-semibold tracking-widest uppercase text-primary mb-8">
            <span className="w-6 h-px bg-primary" />
            Chief Analytics Officer · AI Builder
          </p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] mb-8 max-w-4xl">
            Building AI systems that{" "}
            <em className="italic text-primary not-italic">accelerate decisions</em>{" "}
            and growth.
          </h1>

          <p className="font-sans text-lg text-muted-foreground max-w-xl leading-relaxed mb-14">
            25 years leading analytics transformation at Fortune 500 companies —
            now building practical AI products that actually ship.
          </p>

          {/* Proof strip */}
          <div className="flex flex-wrap gap-12 mb-14">
            {PROOF.map((p) => (
              <div key={p.value}>
                <div className="font-serif text-4xl text-foreground leading-none">{p.value}</div>
                <div className="font-sans text-xs text-muted-foreground mt-1.5">{p.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Explore Projects <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-border text-foreground font-sans font-medium text-sm hover:bg-secondary transition-colors"
            >
              Work with Me
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <hr className="border-border" />
      </div>

      {/* ── Projects ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-primary mb-4">
          What I'm Building
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-14">
          AI projects in production
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {PROJECTS.map((project) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="group relative bg-card border border-border rounded-xl p-7 hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
              <div className="flex flex-wrap gap-2 mb-5">
                {project.tags.slice(0, 2).map((t) => (
                  <span key={t} className="font-sans text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                    {t}
                  </span>
                ))}
                <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[project.status]}`}>
                  {project.status}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-2">{project.name}</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">{project.tagline}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-sans font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View project <MoveRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <hr className="border-border" />
      </div>

      {/* ── Principles ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-primary mb-4">
          How I Work
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-14">The operating model</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="bg-card border border-border rounded-xl p-8">
              <div className="font-serif text-5xl text-border leading-none mb-5">{p.n}</div>
              <h3 className="font-serif text-xl text-foreground mb-3">{p.title}</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <hr className="border-border" />
      </div>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center max-w-6xl mx-auto">
        <p className="font-sans text-sm text-muted-foreground mb-4">
          Open to advisory, executive, and build collaboration
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">Ready to build something?</h2>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-sans font-medium hover:bg-primary/90 transition-colors"
        >
          Get in touch <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
