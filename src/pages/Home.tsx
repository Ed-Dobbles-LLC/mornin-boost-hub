import { useEffect, useRef } from "react";

/* ── Brand tokens ── */
const C = {
  bg: "#1D1D1D",
  card: "#252525",
  text: "#F7FBFE",
  muted: "rgba(247,251,254,0.55)",
  red: "#DB5461",
  teal: "#00B98E",
  sky: "#85E4FD",
  navy: "#060A57",
  steel: "#225A8E",
  bright: "#3273DB",
  divider: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.10)",
} as const;

const font = "'Montserrat', 'Segoe UI', sans-serif";

/* ── KPI data ── */
const PROOF = [
  { value: "$300M+", label: "Enterprise value created" },
  { value: "25+", label: "Years in analytics leadership" },
  { value: "60 FTE", label: "Largest team led · $17M budget" },
  { value: "4", label: "AI products in production" },
];

/* ── Operating model data (trimmed descriptions) ── */
const LAYERS = [
  {
    n: 1,
    name: "DATA FOUNDATION & PLUMBING",
    pct: "40-60%",
    desc: "The invisible tax on every analytics org. AI handles profiling, data dictionaries, quality monitoring, and lineage mapping so analysts focus on what the data means, not where it lives.",
  },
  {
    n: 2,
    name: "DEMAND MANAGEMENT",
    pct: "10-15%",
    desc: "The work-about-work that fragments focus. AI automates intake triage, prioritization, capacity planning, and status updates so humans focus on the analysis, not the admin.",
  },
  {
    n: 3,
    name: "ANALYSIS & DEVELOPMENT",
    pct: "15-20%",
    desc: "AI as a thought partner \u2014 automated exploratory analysis, hypothesis generation, code review, and pattern detection that makes good analysts faster without replacing their judgment.",
  },
  {
    n: 4,
    name: "INSIGHT SYNTHESIS & STORYTELLING",
    pct: "5-10%",
    desc: "The last mile where insights become decisions. Narrative generation, executive summaries, and multi-audience versioning \u2014 where \u2018Geek that can Speak\u2019 becomes an operating principle.",
  },
  {
    n: 5,
    name: "KNOWLEDGE MANAGEMENT",
    pct: "5-10%",
    desc: "Institutional memory that doesn\u2019t walk out the door. Semantic search across past analyses, methodology docs, and decision logs so nobody solves the same problem twice.",
  },
  {
    n: 6,
    name: "OPERATIONS & IMPROVEMENT",
    pct: "5-10%",
    desc: "The continuous improvement loop most teams never get to. SLA monitoring, skills gap analysis, and stakeholder feedback synthesis \u2014 making the analytics function itself better over time.",
  },
  {
    n: 7,
    name: "AI GOVERNANCE & QA",
    pct: "new layer",
    desc: "Enterprise AI without enterprise risk. Code audit, hallucination detection, cost tracking, and full interaction logging \u2014 the layer that separates responsible AI from \u2018hope for the best.\u2019",
  },
  {
    n: 8,
    name: "ONBOARDING & ENABLEMENT",
    pct: "new layer",
    desc: "Compressing months of ramp-up into weeks. Guided data tours, role-based learning paths, and tribal knowledge capture \u2014 because nobody should figure out the data landscape alone.",
  },
];

/* ── Intersection Observer hook for fade-in ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {children}
    </div>
  );
}

/* ── Shared styles ── */
const sectionPad = { padding: "120px 24px", maxWidth: 1080, margin: "0 auto" } as const;
const sectionHeader: React.CSSProperties = {
  fontFamily: font,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.14em",
  color: C.red,
  textTransform: "uppercase",
  marginBottom: 20,
};
const h2Style: React.CSSProperties = {
  fontFamily: font,
  fontWeight: 700,
  fontSize: "clamp(26px, 3.5vw, 38px)",
  letterSpacing: "0.04em",
  color: C.text,
  lineHeight: 1.3,
  marginBottom: 24,
};
const divider: React.CSSProperties = {
  height: 1,
  backgroundColor: C.divider,
  border: "none",
  margin: 0,
};

/* ── LinkedIn SVG ── */
function LinkedInIcon({ size = 20, color = C.muted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════ */
/*  HOME PAGE                                        */
/* ══════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", fontFamily: font, color: C.text, overflowX: "hidden" }}>

      {/* ═══ SECTION 1: HERO ═══ */}
      <section>
        <div style={{ ...sectionPad, paddingTop: 48, paddingBottom: 128 }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 80 }}>
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 22, letterSpacing: "0.03em" }}>
              <span style={{ color: C.text }}>Dobbles</span>
              <span style={{ color: C.red }}>.AI</span>
            </span>
            <a
              href="https://linkedin.com/in/ed-dobbles"
              target="_blank"
              rel="noopener noreferrer"
              style={{ opacity: 0.4, transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.4")}
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={22} color={C.text} />
            </a>
          </div>

          {/* Identity — left-aligned */}
          <FadeIn>
            <div style={{ maxWidth: 740 }}>
              <h1 style={{ fontFamily: font, fontWeight: 700, fontSize: "clamp(44px, 7vw, 76px)", letterSpacing: "0.03em", lineHeight: 1.08, marginBottom: 20, color: C.text }}>
                Ed Dobbles
              </h1>
              <p style={{ fontFamily: font, fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 16px)", letterSpacing: "0.10em", textTransform: "uppercase", color: C.red, marginBottom: 28 }}>
                Chief Analytics Officer&ensp;|&ensp;Chief Data Officer&ensp;|&ensp;VP of Analytics
              </p>
              <p style={{ fontFamily: font, fontWeight: 400, fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.75, color: C.muted, maxWidth: 620 }}>
                <span style={{ color: C.text, fontWeight: 700 }}>The Geek that can Speak</span> — 25 years transforming data into competitive advantage for Fortune 500 companies. I don't just talk about AI-powered analytics. I build it.
              </p>
            </div>
          </FadeIn>

          {/* KPI strip */}
          <FadeIn>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 32,
              marginTop: 64,
              paddingTop: 48,
              borderTop: `1px solid ${C.divider}`,
            }}>
              {PROOF.map((p) => (
                <div key={p.value}>
                  <div style={{ fontFamily: font, fontWeight: 700, fontSize: "clamp(28px, 4vw, 38px)", color: C.text, lineHeight: 1, marginBottom: 8 }}>
                    {p.value}
                  </div>
                  <div style={{ fontFamily: font, fontWeight: 400, fontSize: 12, color: C.muted, letterSpacing: "0.03em" }}>
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <div style={divider} />

      {/* ═══ SECTION 2: THE THESIS ═══ */}
      <section>
        <div style={sectionPad}>
          <FadeIn>
            <p style={sectionHeader}>THE PROBLEM EVERY ANALYTICS ORG FACES</p>
          </FadeIn>
          <FadeIn>
            <blockquote style={{
              fontFamily: font, fontWeight: 700,
              fontSize: "clamp(22px, 3.2vw, 32px)",
              lineHeight: 1.4, color: C.text,
              borderLeft: `3px solid ${C.red}`,
              paddingLeft: 24, margin: "0 0 36px 0",
              maxWidth: 820,
            }}>
              Analytics teams burn ~60% of capacity on data plumbing, project management, and documentation instead of strategic analysis and storytelling.
            </blockquote>
          </FadeIn>
          <FadeIn>
            <p style={{ fontFamily: font, fontWeight: 700, fontSize: 19, color: C.sky, marginBottom: 28 }}>
              I'm building the operating system that flips that ratio.
            </p>
          </FadeIn>
          <FadeIn>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 16, lineHeight: 1.85, color: C.muted, maxWidth: 820 }}>
              After 25 years leading analytics organizations at Diageo, H&R Block, SuperValu, and Best Buy — managing teams of 60+, budgets of $17M+, and delivering $300M+ in enterprise value — I've systematized what works into a portable, AI-powered framework spanning eight layers of the analytics lifecycle. Enterprise-grade governance included. Adaptable to any modern analytics environment, any IT stack, any industry.
            </p>
          </FadeIn>
        </div>
      </section>

      <div style={divider} />

      {/* ═══ SECTION 3: 8-LAYER MODEL ═══ */}
      <section>
        <div style={sectionPad}>
          <FadeIn>
            <p style={sectionHeader}>AI ANALYTICS OPERATING SYSTEM</p>
            <h2 style={h2Style}>Eight layers. One operating model.</h2>
          </FadeIn>
          <FadeIn>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 16, lineHeight: 1.85, color: C.muted, maxWidth: 820, marginBottom: 56 }}>
              Every analytics organization I've led hits the same bottlenecks. This framework maps the entire analytics lifecycle and identifies where AI amplifies human judgment rather than replacing it. Technology-agnostic, governance-included, and ready to deploy from Day 1.
            </p>
          </FadeIn>

          {/* Layer cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))", gap: 16 }}>
            {LAYERS.map((layer) => (
              <FadeIn key={layer.n}>
                <div style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: 28,
                  height: "100%",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontFamily: font, fontWeight: 700, fontSize: 32, color: C.steel, lineHeight: 1, opacity: 0.4 }}>
                      {String(layer.n).padStart(2, "0")}
                    </span>
                    <span style={{ fontFamily: font, fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: C.text }}>
                      {layer.name}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: font, fontWeight: 700, fontSize: 11,
                    color: layer.pct.startsWith("new") ? C.teal : C.red,
                    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14,
                  }}>
                    {layer.pct.startsWith("new") ? layer.pct : `${layer.pct} of team time`}
                  </p>
                  <p style={{ fontFamily: font, fontWeight: 400, fontSize: 14, lineHeight: 1.7, color: C.muted }}>
                    {layer.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 15, lineHeight: 1.8, color: C.muted, marginTop: 56, fontStyle: "italic", maxWidth: 820 }}>
              This isn't a product pitch. It's how I think about building analytics organizations. The framework travels with me — adaptable to your data, your stack, your governance requirements.
            </p>
          </FadeIn>
        </div>
      </section>

      <div style={divider} />

      {/* ═══ SECTION 4: EXECUTIVE INTELLIGENCE TOOLS ═══ */}
      <section>
        <div style={sectionPad}>
          <FadeIn>
            <p style={sectionHeader}>NEVER WALK INTO A MEETING UNINFORMED</p>
            <h2 style={h2Style}>Purpose-built tools for executive preparation and competitive awareness.</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 460px), 1fr))", gap: 20 }}>
            <FadeIn>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 32, height: "100%" }}>
                <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: 19, letterSpacing: "0.03em", color: C.text, marginBottom: 14 }}>
                  Pre-Call Intelligence Briefing Engine
                </h3>
                <p style={{ fontFamily: font, fontWeight: 400, fontSize: 15, lineHeight: 1.75, color: C.muted }}>
                  AI-powered research automation that builds comprehensive briefing documents before every meeting — company background, key players, organizational structure, recent news, strategic context. Transforms hours of manual prep into minutes of structured intelligence.
                </p>
              </div>
            </FadeIn>
            <FadeIn>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 32, height: "100%" }}>
                <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: 19, letterSpacing: "0.03em", color: C.text, marginBottom: 14 }}>
                  AR Intelligence Dashboard
                </h3>
                <p style={{ fontFamily: font, fontWeight: 400, fontSize: 15, lineHeight: 1.75, color: C.muted }}>
                  Continuous competitive and market intelligence monitoring. Automated analysis of market signals, competitive moves, and strategic indicators that keep leadership informed without dedicating analyst headcount to monitoring.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div style={divider} />

      {/* ═══ SECTION 5: LET'S CONNECT ═══ */}
      <section>
        <div style={{ ...sectionPad, textAlign: "center" }}>
          <FadeIn>
            <p style={{ ...sectionHeader, textAlign: "center" }}>LET'S TALK</p>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 17, lineHeight: 1.75, color: C.muted, maxWidth: 560, margin: "0 auto 48px" }}>
              Interested in what an AI-powered analytics operating model could do for your organization? I'm always open to a conversation.
            </p>
          </FadeIn>
          <FadeIn>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 36 }}>
              <a
                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3i0I4YfvjPviD-BuYBOrydiCoKdoMEmFfyqRVSZWrW8e28BlZFToC-bqI1PXJEsd9HpzAhZ54p?gv=true"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: font, fontWeight: 700, fontSize: 14,
                  backgroundColor: C.red, color: C.text,
                  padding: "14px 36px", borderRadius: 4,
                  textDecoration: "none",
                  transition: "filter 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
              >
                Schedule a Conversation
              </a>
              <a
                href="mailto:Ed@Dobbles.AI"
                style={{
                  fontFamily: font, fontWeight: 700, fontSize: 14,
                  backgroundColor: "transparent", color: C.red,
                  border: `2px solid ${C.red}`,
                  padding: "12px 36px", borderRadius: 4,
                  textDecoration: "none",
                  transition: "background-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.red; e.currentTarget.style.color = C.text; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = C.red; }}
              >
                Send an Email
              </a>
            </div>
            <a
              href="https://linkedin.com/in/ed-dobbles"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", opacity: 0.35, transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.35")}
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={22} color={C.text} />
            </a>
          </FadeIn>
        </div>
      </section>

      <div style={divider} />

      {/* ═══ SECTION 6: FOOTER ═══ */}
      <footer style={{ padding: "56px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 6 }}>
            Ed Dobbles
          </p>
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 13, color: C.muted, marginBottom: 4 }}>
            Minneapolis-St. Paul Metro
          </p>
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 13, color: C.muted, marginBottom: 28 }}>
            Doctor of Business Administration — Rutgers University
          </p>
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 11, color: "rgba(247,251,254,0.25)" }}>
            &copy; 2026 Dobbles.AI
          </p>
        </div>
      </footer>
    </div>
  );
}
