import { useEffect, useRef } from "react";

/* ── Brand tokens ── */
const C = {
  bg: "#1D1D1D",
  bgDeep: "#0D0D0D",
  card: "#1D1D1D",
  text: "#F7FBFE",
  muted: "rgba(247,251,254,0.55)",
  red: "#DB5461",
  teal: "#00B98E",
  sky: "#85E4FD",
  navy: "#060A57",
  steel: "#225A8E",
  bright: "#3273DB",
  border: "rgba(255,255,255,0.08)",
  placeholder: "#2A2A2A",
} as const;

const font = "'Montserrat', 'Segoe UI', sans-serif";

/* ── Operating model data ── */
const LAYERS = [
  {
    n: 1,
    name: "DATA FOUNDATION & PLUMBING",
    pct: "40-60%",
    desc: "The invisible tax on every analytics org. Profiling, data dictionary generation, quality monitoring, lineage mapping, governance documentation — work that must be done but doesn\u2019t require human judgment. AI handles the scaffolding so analysts focus on what the data means, not where it lives.",
  },
  {
    n: 2,
    name: "DEMAND MANAGEMENT",
    pct: "10-15%",
    desc: "The project management overhead that buries analysts. Intake triage, prioritization, capacity planning, stakeholder status updates — the work-about-work that fragments focus. AI automates the queue so humans focus on the analysis, not the admin.",
  },
  {
    n: 3,
    name: "ANALYSIS & DEVELOPMENT",
    pct: "15-20%",
    desc: "Accelerating the analytical craft itself. Automated exploratory analysis, hypothesis generation, code review, pattern detection — AI as a thought partner that makes good analysts faster without replacing their judgment.",
  },
  {
    n: 4,
    name: "INSIGHT SYNTHESIS & STORYTELLING",
    pct: "5-10%",
    desc: "The last mile where insights become decisions. Narrative generation, executive summaries, multi-audience versioning — the translation layer between what the data says and what the business does about it. This is where \u2018Geek that can Speak\u2019 becomes an operating principle, not just a personal brand.",
  },
  {
    n: 5,
    name: "KNOWLEDGE MANAGEMENT",
    pct: "5-10%",
    desc: "The institutional memory that walks out the door with every departure. Semantic search across past analyses, methodology documentation, decision logs — AI preserves and surfaces what the team has already learned so nobody solves the same problem twice.",
  },
  {
    n: 6,
    name: "OPERATIONS & IMPROVEMENT",
    pct: "5-10%",
    desc: "The continuous improvement loop most teams never get to. SLA monitoring, skills gap analysis, stakeholder feedback synthesis — the meta-work of making the analytics function itself better over time.",
  },
  {
    n: 7,
    name: "AI GOVERNANCE & QA",
    pct: "new layer",
    desc: "Enterprise AI without enterprise risk. Independent code audit, hallucination detection, cost tracking, prompt version control, full interaction logging — the governance layer that differentiates \u2018we use AI responsibly\u2019 from \u2018we gave analysts ChatGPT and hoped for the best.\u2019",
  },
  {
    n: 8,
    name: "ONBOARDING & ENABLEMENT",
    pct: "new layer",
    desc: "Compressing months of ramp-up into weeks. Guided data tours, role-based learning paths, tribal knowledge capture, 90-day acceleration plans — because the fastest way to destroy a new hire\u2019s momentum is making them figure out the data landscape alone.",
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
      { threshold: 0.12 }
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
        transform: "translateY(24px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {children}
    </div>
  );
}

/* ── Shared styles ── */
const sectionPad = { padding: "96px 24px", maxWidth: 1120, margin: "0 auto" } as const;
const sectionHeader: React.CSSProperties = {
  fontFamily: font,
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.12em",
  color: C.red,
  textTransform: "uppercase",
  marginBottom: 16,
};
const h2Style: React.CSSProperties = {
  fontFamily: font,
  fontWeight: 700,
  fontSize: "clamp(28px, 4vw, 40px)",
  letterSpacing: "0.05em",
  color: C.text,
  lineHeight: 1.25,
  marginBottom: 20,
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
    <div style={{ backgroundColor: C.bgDeep, minHeight: "100vh", fontFamily: font, color: C.text, overflowX: "hidden" }}>

      {/* ═══ SECTION 1: HERO ═══ */}
      <section style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...sectionPad, paddingTop: 48, paddingBottom: 112 }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 96 }}>
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 22, letterSpacing: "0.03em" }}>
              <span style={{ color: C.text }}>Dobbles</span>
              <span style={{ color: C.red }}>.AI</span>
            </span>
            <a
              href="https://linkedin.com/in/ed-dobbles"
              target="_blank"
              rel="noopener noreferrer"
              style={{ opacity: 0.5, transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={22} color={C.text} />
            </a>
          </div>

          {/* Identity */}
          <FadeIn>
            <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
              <h1 style={{ fontFamily: font, fontWeight: 700, fontSize: "clamp(44px, 7vw, 80px)", letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 20, color: C.text }}>
                Ed Dobbles
              </h1>
              <p style={{ fontFamily: font, fontWeight: 700, fontSize: "clamp(14px, 2vw, 18px)", letterSpacing: "0.08em", textTransform: "uppercase", color: C.red, marginBottom: 32 }}>
                Chief Analytics Officer&ensp;|&ensp;Chief Data Officer&ensp;|&ensp;VP of Analytics
              </p>
              <p style={{ fontFamily: font, fontWeight: 400, fontSize: "clamp(16px, 2.2vw, 20px)", lineHeight: 1.7, color: C.muted, maxWidth: 680, margin: "0 auto" }}>
                <span style={{ color: C.text, fontWeight: 700 }}>The Geek that can Speak</span> — 25 years transforming data into competitive advantage for Fortune 500 companies. I don't just talk about AI-powered analytics. I build it.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 2: THE THESIS ═══ */}
      <section style={{ backgroundColor: C.bgDeep, borderBottom: `1px solid ${C.border}` }}>
        <div style={sectionPad}>
          <FadeIn>
            <p style={sectionHeader}>THE PROBLEM EVERY ANALYTICS ORG FACES</p>
          </FadeIn>
          <FadeIn>
            <blockquote style={{
              fontFamily: font, fontWeight: 700,
              fontSize: "clamp(22px, 3.5vw, 34px)",
              lineHeight: 1.35, color: C.text,
              borderLeft: `3px solid ${C.red}`,
              paddingLeft: 24, margin: "0 0 32px 0",
            }}>
              Analytics teams burn ~60% of capacity on data plumbing, project management, and documentation instead of strategic analysis and storytelling.
            </blockquote>
          </FadeIn>
          <FadeIn>
            <p style={{ fontFamily: font, fontWeight: 700, fontSize: 20, color: C.sky, marginBottom: 24 }}>
              I'm building the operating system that flips that ratio.
            </p>
          </FadeIn>
          <FadeIn>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 16, lineHeight: 1.8, color: C.muted, maxWidth: 860 }}>
              After 25 years leading analytics organizations at Diageo, H&R Block, SuperValu, and Best Buy — managing teams of 60+, budgets of $17M+, and delivering $300M+ in enterprise value — I've systematized what works into a portable, AI-powered framework spanning eight layers of the analytics lifecycle. Enterprise-grade governance included. Adaptable to any modern analytics environment, any IT stack, any industry.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 3: 8-LAYER MODEL ═══ */}
      <section style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={sectionPad}>
          <FadeIn>
            <p style={sectionHeader}>AI ANALYTICS OPERATING SYSTEM</p>
            <h2 style={h2Style}>Eight layers. One operating model. Built from 25 years of knowing where analytics orgs break down.</h2>
          </FadeIn>
          <FadeIn>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 16, lineHeight: 1.8, color: C.muted, maxWidth: 900, marginBottom: 48 }}>
              Every analytics organization I've led — from 60-person enterprise teams to 2-person startups — hits the same bottlenecks. This framework maps the entire analytics lifecycle and identifies where AI amplifies human judgment rather than replacing it. The model is technology-agnostic and adapts to whatever IT environment and governance requirements exist. Some components I've already built and used in production. Others are architected and ready to deploy. All of them reflect how I'd run your analytics org from Day 1.
            </p>
          </FadeIn>

          {/* Layer cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 500px), 1fr))", gap: 16 }}>
            {LAYERS.map((layer) => (
              <FadeIn key={layer.n}>
                <div style={{
                  backgroundColor: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: 28,
                  height: "100%",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontFamily: font, fontWeight: 700, fontSize: 36, color: C.steel, lineHeight: 1, opacity: 0.45 }}>
                      {String(layer.n).padStart(2, "0")}
                    </span>
                    <span style={{ fontFamily: font, fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", color: C.text }}>
                      {layer.name}
                    </span>
                  </div>
                  <p style={{ fontFamily: font, fontWeight: 700, fontSize: 12, color: layer.pct.startsWith("new") ? C.teal : C.red, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
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
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 16, lineHeight: 1.8, color: C.muted, marginTop: 48, fontStyle: "italic", maxWidth: 900 }}>
              This isn't a product pitch. It's how I think about building analytics organizations. The framework travels with me — adaptable to your data, your stack, your governance requirements.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 4: EXECUTIVE INTELLIGENCE TOOLS ═══ */}
      <section style={{ backgroundColor: C.bgDeep, borderBottom: `1px solid ${C.border}` }}>
        <div style={sectionPad}>
          <FadeIn>
            <p style={sectionHeader}>NEVER WALK INTO A MEETING UNINFORMED</p>
            <h2 style={h2Style}>Purpose-built tools I use daily for executive preparation and competitive awareness.</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))", gap: 20 }}>
            {/* Card 1 */}
            <FadeIn>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 32, height: "100%" }}>
                <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: 20, letterSpacing: "0.03em", color: C.text, marginBottom: 12 }}>
                  Pre-Call Intelligence Briefing Engine
                </h3>
                <p style={{ fontFamily: font, fontWeight: 400, fontSize: 15, lineHeight: 1.7, color: C.muted, marginBottom: 24 }}>
                  AI-powered research automation that builds comprehensive briefing documents before every meeting — company background, key players, organizational structure, recent news, strategic context. Transforms hours of manual prep into minutes of structured intelligence.
                </p>
                <div style={{
                  backgroundColor: C.placeholder,
                  borderRadius: 8,
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontFamily: font, fontWeight: 400, fontSize: 14, color: C.muted }}>Screenshot Coming Soon</span>
                </div>
              </div>
            </FadeIn>
            {/* Card 2 */}
            <FadeIn>
              <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 32, height: "100%" }}>
                <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: 20, letterSpacing: "0.03em", color: C.text, marginBottom: 12 }}>
                  AR Intelligence Dashboard
                </h3>
                <p style={{ fontFamily: font, fontWeight: 400, fontSize: 15, lineHeight: 1.7, color: C.muted, marginBottom: 24 }}>
                  Continuous competitive and market intelligence monitoring. Automated analysis of market signals, competitive moves, and strategic indicators that keep leadership informed without dedicating analyst headcount to monitoring.
                </p>
                <div style={{
                  backgroundColor: C.placeholder,
                  borderRadius: 8,
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontFamily: font, fontWeight: 400, fontSize: 14, color: C.muted }}>Screenshot Coming Soon</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: LET'S CONNECT ═══ */}
      <section style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...sectionPad, textAlign: "center" }}>
          <FadeIn>
            <p style={{ ...sectionHeader, textAlign: "center" }}>LET'S TALK</p>
            <p style={{ fontFamily: font, fontWeight: 400, fontSize: 18, lineHeight: 1.7, color: C.muted, maxWidth: 600, margin: "0 auto 40px" }}>
              Interested in what an AI-powered analytics operating model could do for your organization? I'm always open to a conversation.
            </p>
          </FadeIn>
          <FadeIn>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 32 }}>
              <a
                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3i0I4YfvjPviD-BuYBOrydiCoKdoMEmFfyqRVSZWrW8e28BlZFToC-bqI1PXJEsd9HpzAhZ54p?gv=true"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: font, fontWeight: 700, fontSize: 15,
                  backgroundColor: C.red, color: C.text,
                  padding: "14px 32px", borderRadius: 4,
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
                  fontFamily: font, fontWeight: 700, fontSize: 15,
                  backgroundColor: "transparent", color: C.red,
                  border: `2px solid ${C.red}`,
                  padding: "12px 32px", borderRadius: 4,
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
              style={{ display: "inline-block", opacity: 0.45, transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.45")}
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={24} color={C.text} />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 6: FOOTER ═══ */}
      <footer style={{ backgroundColor: C.bgDeep, padding: "48px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 60, height: 1, backgroundColor: C.border, margin: "0 auto 32px" }} />
          <p style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>
            Ed Dobbles
          </p>
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 13, color: C.muted, marginBottom: 4 }}>
            Minneapolis-St. Paul Metro
          </p>
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 13, color: C.muted, marginBottom: 24 }}>
            Doctor of Business Administration — Rutgers University
          </p>
          <p style={{ fontFamily: font, fontWeight: 400, fontSize: 12, color: "rgba(247,251,254,0.3)" }}>
            &copy; 2026 Dobbles.AI
          </p>
        </div>
      </footer>
    </div>
  );
}
