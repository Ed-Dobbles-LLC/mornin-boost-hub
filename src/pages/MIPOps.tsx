import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Design System ────────────────────────────────────────────────────────────
const C = {
  navy:    "#060A57",
  coral:   "#DB5461",
  teal:    "#00B98E",
  sky:     "#85E4FD",
  bg:      "#07090F",
  surface: "#0C0F1C",
  card:    "#10142A",
  border:  "#1C2140",
  border2: "#252A4A",
  text:    "#DDE1F0",
  muted:   "#5A6080",
  faint:   "#2A2F50",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

const SEV = {
  critical: { label: "CRITICAL", color: "#FF4A5A", bg: "rgba(255,74,90,0.12)",  dot: "#FF4A5A" },
  high:     { label: "HIGH",     color: C.coral,   bg: "rgba(219,84,97,0.10)",  dot: C.coral   },
  medium:   { label: "MEDIUM",   color: "#F0B840",  bg: "rgba(240,184,64,0.10)", dot: "#F0B840" },
  low:      { label: "LOW",      color: C.muted,    bg: "rgba(90,96,128,0.12)",  dot: C.muted   },
};

const CATS = {
  bug:      { label: "Bug",           icon: "🐛", color: C.coral },
  infra:    { label: "Infrastructure",icon: "⚙️", color: C.sky   },
  arch:     { label: "Architecture",  icon: "🏗️", color: "#C084FC" },
  process:  { label: "Process",       icon: "📋", color: C.teal  },
  data:     { label: "Data Quality",  icon: "🗄️", color: "#F0B840" },
};

// ─── Storage helpers ──────────────────────────────────────────────────────────
const DEBT_KEY      = "mip:debt_v2";
const DECISIONS_KEY = "mip:decisions_v2";

async function load(key: string, fallback: any) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
async function save(key: string, val: any) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── AI proxy ─────────────────────────────────────────────────────────────────
const MIP_API = "https://mip-service-production.up.railway.app";

async function callAI(system: string, prompt: string, max_tokens: number): Promise<string> {
  const res = await fetch(`${MIP_API}/api/ai/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, prompt, max_tokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.text;
}

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────────────────
const BRIEFING_PROMPT = `You are the MIP Session Briefing Generator for Ed Dobbles' Menu Intelligence Pipeline.

Context: MIP is a SaaS pipeline extracting beverage brand data from bar/restaurant menus for spirits clients. Client: Moët Hennessy, $75-100K/yr contract. Infrastructure: Railway Pro, Neon PostgreSQL (~3M venues), S3. Solo founder. Session-to-session continuity is the primary PM challenge.

Given a session summary, produce a crisp operational briefing for the NEXT session. Return ONLY this JSON, no fences, no commentary:

{
  "snapshot": "2-sentence honest state of the pipeline RIGHT NOW. Facts only.",
  "running_jobs": [
    { "name": "job name", "status": "running|complete|failed|unknown", "note": "one-line detail" }
  ],
  "priorities": [
    { "action": "specific concrete action", "why": "one-line rationale", "mins": estimated_minutes_as_number }
  ],
  "risks": ["specific risk that could bite you today"],
  "do_not_touch": ["thing and brief reason why not"],
  "claude_code_context": "The single most important thing to paste into Claude Code at session start so it has full context."
}

Rules:
- priorities array: max 4 items, ordered by impact × urgency
- running_jobs: only jobs that are actually in-flight, skip completed ones
- do_not_touch: things that are running or fragile that could be accidentally broken
- claude_code_context: this should be a dense 2-4 sentence paragraph Claude Code can use as a prompt prefix`;

const COACH_PROMPT = `You are the MIP Strategic Coach. Analyze this session summary and return ONLY this JSON, no fences:

{
  "overall": 1-5,
  "summary": "2-3 sentences. Honest. No flattery.",
  "deadline": { "score": 1-5, "days": number_or_null, "verdict": "1 sentence", "blockers": ["blocker"] },
  "debt":     { "score": 1-5, "trend": "growing|stable|shrinking", "items": ["item"] },
  "wip":      { "score": 1-5, "count": number, "over": boolean, "streams": ["stream"] },
  "bottleneck": { "score": 1-5, "primary": "the one thing", "others": ["other"] },
  "next24":   { "action": "single most important action", "why": "rationale", "avoid": ["avoid this"] }
}

Score: 1=healthy 2=watch 3=concern 4=critical 5=on-fire`;

// ─── Tiny components ──────────────────────────────────────────────────────────
const Dot = ({ color, pulse }: { color: string; pulse?: boolean }) => (
  <span style={{
    display:"inline-block", width:6, height:6, borderRadius:"50%",
    background: color, flexShrink:0,
    boxShadow:`0 0 5px ${color}`,
    animation: pulse ? "pulse 1.5s ease-in-out infinite" : "none",
  }}/>
);

const Tag = ({ label, color, bg, small }: { label: string; color: string; bg?: string; small?: boolean }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:5,
    background: bg || "rgba(90,96,128,0.15)",
    border:`1px solid ${color}30`,
    borderRadius:3, padding: small ? "2px 7px" : "3px 9px",
    fontSize: small ? 10 : 11, fontWeight:700,
    letterSpacing:"0.08em", color, fontFamily:"Space Mono, monospace",
    whiteSpace:"nowrap",
  }}>{label}</span>
);

const Btn = ({ children, onClick, variant="primary", disabled, small, style: sx }: any) => {
  const [hov, setHov] = useState(false);
  const variants: any = {
    primary: {
      bg: hov ? "#1A2A90" : C.navy,
      border: `1px solid ${C.sky}50`,
      color: C.sky,
    },
    danger: {
      bg: hov ? "rgba(219,84,97,0.2)" : "rgba(219,84,97,0.1)",
      border: `1px solid ${C.coral}40`,
      color: C.coral,
    },
    ghost: {
      bg: hov ? C.faint : "transparent",
      border: `1px solid ${C.border}`,
      color: C.muted,
    },
    teal: {
      bg: hov ? "rgba(0,185,142,0.2)" : "rgba(0,185,142,0.1)",
      border: `1px solid ${C.teal}40`,
      color: C.teal,
    },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...v, borderRadius:5,
        padding: small ? "5px 12px" : "9px 18px",
        fontSize: small ? 11 : 12, fontWeight:700,
        letterSpacing:"0.07em", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily:"Space Mono, monospace",
        opacity: disabled ? 0.45 : 1,
        transition:"all 0.15s",
        ...sx,
      }}
    >{children}</button>
  );
};

// ─── BRIEFING TAB ─────────────────────────────────────────────────────────────
function BriefingTab() {
  const [input, setInput]     = useState("");
  const [mode, setMode]       = useState("intro"); // intro | input | loading | result
  const [result, setResult]   = useState<any>(null);
  const [phase, setPhase]     = useState(0);
  const [err, setErr]         = useState("");

  const PHASES = [
    "Reading session summary…",
    "Identifying running jobs…",
    "Sequencing priorities…",
    "Flagging risks…",
    "Writing Claude Code context…",
  ];

  useEffect(() => {
    if (mode !== "loading") return;
    const t = setInterval(() => setPhase(p => (p+1) % PHASES.length), 1600);
    return () => clearInterval(t);
  }, [mode]);

  const run = async () => {
    if (input.trim().length < 80) { setErr("Paste a real session summary first."); return; }
    setErr(""); setMode("loading");
    try {
      const raw = await callAI(BRIEFING_PROMPT, `Session summary:\n\n${input}`, 1200);
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(parsed); setMode("result");
    } catch(e: any) {
      setErr(`Failed: ${e.message}`); setMode("input");
    }
  };

  const reset = () => { setMode("input"); setResult(null); setErr(""); };

  const STATUS_COLORS: any = { running:C.teal, complete:C.muted, failed:C.coral, unknown:"#F0B840" };

  if (mode === "intro") return (
    <div style={{ display:"flex", flexDirection:"column", gap:32, padding:"8px 0", animation:"fadeUp 0.4s ease" }}>
      <div>
        <div style={{ fontSize:24, fontWeight:700, color:C.text, fontFamily:"DM Sans, sans-serif", marginBottom:8 }}>
          Session Briefing
        </div>
        <div style={{ fontSize:14, color:C.muted, lineHeight:1.7, maxWidth:520 }}>
          Paste your last session summary. Get a structured operational briefing — current state, priorities, risks, and a ready-to-paste Claude Code context block. Replaces "ask Claude what we were doing."
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, maxWidth:560 }}>
        {[
          ["🔍", "Current State", "Honest snapshot of pipeline health right now"],
          ["🎯", "Top Priorities", "Ordered by impact × urgency, with time estimates"],
          ["⚠️", "Risks & Limits", "What could bite you today, what not to touch"],
        ].map(([ic,t,d]) => (
          <div key={t} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"16px 14px" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{ic}</div>
            <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:4, fontFamily:"Space Mono, monospace" }}>{t}</div>
            <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{d}</div>
          </div>
        ))}
      </div>
      <Btn onClick={() => setMode("input")} style={{ alignSelf:"flex-start" }}>
        START BRIEFING →
      </Btn>
    </div>
  );

  if (mode === "loading") return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:"60px 0" }}>
      <div style={{ position:"relative", width:52, height:52 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position:"absolute", inset: i*8, borderRadius:"50%",
            border:"2px solid transparent",
            borderTopColor:[C.sky, C.teal, C.coral][i],
            animation:`spin ${0.9 + i*0.35}s linear infinite`,
          }}/>
        ))}
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:13, color:C.sky, fontFamily:"Space Mono, monospace", fontWeight:700, marginBottom:4 }}>
          {PHASES[phase]}
        </div>
        <div style={{ fontSize:11, color:C.muted }}>Generating session briefing</div>
      </div>
    </div>
  );

  if (mode === "result" && result) return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:13, fontFamily:"Space Mono, monospace", color:C.teal, fontWeight:700 }}>
          ✓ BRIEFING READY
        </div>
        <Btn onClick={reset} variant="ghost" small>NEW SESSION ↩</Btn>
      </div>

      {/* Snapshot */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.sky}`, borderRadius:8, padding:"18px 20px" }}>
        <div style={{ fontSize:10, fontFamily:"Space Mono, monospace", color:C.muted, letterSpacing:"0.1em", marginBottom:8 }}>CURRENT STATE</div>
        <p style={{ fontSize:14, color:C.text, lineHeight:1.7, fontFamily:"DM Sans, sans-serif" }}>{result.snapshot}</p>
      </div>

      {/* Running jobs + Priorities side by side */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {/* Running jobs */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"16px 18px" }}>
          <div style={{ fontSize:10, fontFamily:"Space Mono, monospace", color:C.muted, letterSpacing:"0.1em", marginBottom:12 }}>RUNNING JOBS</div>
          {result.running_jobs?.length > 0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {result.running_jobs.map((j: any, i: number) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <Dot color={STATUS_COLORS[j.status] || C.muted} pulse={j.status==="running"} />
                  <div>
                    <div style={{ fontSize:12, color:C.text, fontWeight:600, fontFamily:"DM Sans, sans-serif" }}>{j.name}</div>
                    <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{j.note}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize:12, color:C.muted }}>No active jobs detected</div>
          )}
        </div>

        {/* Priorities */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"16px 18px" }}>
          <div style={{ fontSize:10, fontFamily:"Space Mono, monospace", color:C.muted, letterSpacing:"0.1em", marginBottom:12 }}>PRIORITIES</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {result.priorities?.map((p: any, i: number) => (
              <div key={i} style={{ display:"flex", gap:10 }}>
                <div style={{
                  width:20, height:20, borderRadius:4, flexShrink:0,
                  background: i===0 ? C.coral : i===1 ? "#F0B840" : C.faint,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, color: i < 2 ? "#fff" : C.muted,
                  fontFamily:"Space Mono, monospace",
                }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:C.text, fontWeight:600, fontFamily:"DM Sans, sans-serif", lineHeight:1.4 }}>{p.action}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                    <div style={{ fontSize:11, color:C.muted }}>{p.why}</div>
                    {p.mins && <Tag label={`~${p.mins}m`} color={C.muted} small />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risks + Do Not Touch */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ background:"rgba(240,184,64,0.05)", border:`1px solid rgba(240,184,64,0.2)`, borderRadius:8, padding:"16px 18px" }}>
          <div style={{ fontSize:10, fontFamily:"Space Mono, monospace", color:"#F0B840", letterSpacing:"0.1em", marginBottom:10 }}>⚠ RISKS TODAY</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {result.risks?.map((r: string, i: number) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ color:"#F0B840", fontSize:11, marginTop:2, flexShrink:0 }}>—</span>
                <div style={{ fontSize:12, color:C.text, lineHeight:1.5, fontFamily:"DM Sans, sans-serif" }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:"rgba(219,84,97,0.05)", border:`1px solid rgba(219,84,97,0.2)`, borderRadius:8, padding:"16px 18px" }}>
          <div style={{ fontSize:10, fontFamily:"Space Mono, monospace", color:C.coral, letterSpacing:"0.1em", marginBottom:10 }}>🚫 DO NOT TOUCH</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {result.do_not_touch?.map((r: string, i: number) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ color:C.coral, fontSize:11, marginTop:2, flexShrink:0 }}>—</span>
                <div style={{ fontSize:12, color:C.text, lineHeight:1.5, fontFamily:"DM Sans, sans-serif" }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claude Code Context */}
      {result.claude_code_context && (
        <div style={{ background:C.card, border:`1px solid ${C.teal}30`, borderRadius:8, padding:"16px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:10, fontFamily:"Space Mono, monospace", color:C.teal, letterSpacing:"0.1em" }}>
              CLAUDE CODE CONTEXT — PASTE THIS AT SESSION START
            </div>
            <Btn small variant="teal" onClick={() => navigator.clipboard?.writeText(result.claude_code_context)}>
              COPY
            </Btn>
          </div>
          <p style={{
            fontSize:13, color:C.text, lineHeight:1.7,
            fontFamily:"DM Sans, sans-serif",
            background:"rgba(0,185,142,0.04)",
            border:`1px solid ${C.teal}15`,
            borderRadius:6, padding:"12px 14px",
          }}>{result.claude_code_context}</p>
        </div>
      )}
    </div>
  );

  // input mode
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.3s ease" }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text, fontFamily:"DM Sans, sans-serif", marginBottom:6 }}>
          Paste your last session summary
        </div>
        <div style={{ fontSize:12, color:C.muted }}>
          Copy the full contents of your MIP-SESSION-YYYY-MM-DD doc directly.
        </div>
      </div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste session summary here…"
        style={{
          width:"100%", minHeight:240, background:C.card,
          border:`1px solid ${C.border}`, borderRadius:8,
          padding:"14px 16px", color:C.text, fontSize:13,
          fontFamily:"DM Sans, sans-serif", lineHeight:1.6,
          resize:"vertical", outline:"none",
        }}
        onFocus={e => e.target.style.borderColor = C.sky}
        onBlur={e => e.target.style.borderColor = C.border}
      />
      {err && <div style={{ fontSize:12, color:C.coral, fontFamily:"Space Mono, monospace" }}>{err}</div>}
      <div style={{ display:"flex", gap:10 }}>
        <Btn onClick={run} disabled={input.trim().length < 80}>GENERATE BRIEFING →</Btn>
        <Btn onClick={() => setMode("intro")} variant="ghost">BACK</Btn>
      </div>
    </div>
  );
}

// ─── DEBT TRACKER TAB ─────────────────────────────────────────────────────────
function DebtTab() {
  const [items, setItems]     = useState<any[]>([]);
  const [loaded, setLoaded]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]   = useState("open"); // open | resolved | all
  const [form, setForm] = useState({ title:"", notes:"", severity:"medium", category:"bug" });

  useEffect(() => {
    load(DEBT_KEY, []).then(d => { setItems(d); setLoaded(true); });
  }, []);

  const persist = (next: any[]) => { setItems(next); save(DEBT_KEY, next); };

  const add = () => {
    if (!form.title.trim()) return;
    const item = {
      id: Date.now(),
      title: form.title.trim(),
      notes: form.notes.trim(),
      severity: form.severity,
      category: form.category,
      resolved: false,
      created: new Date().toISOString(),
      resolvedAt: null,
    };
    persist([item, ...items]);
    setForm({ title:"", notes:"", severity:"medium", category:"bug" });
    setShowForm(false);
  };

  const resolve = (id: number) => {
    persist(items.map(i => i.id===id ? {...i, resolved:true, resolvedAt:new Date().toISOString()} : i));
  };
  const reopen  = (id: number) => persist(items.map(i => i.id===id ? {...i, resolved:false, resolvedAt:null} : i));
  const remove  = (id: number) => persist(items.filter(i => i.id!==id));

  const open   = items.filter(i => !i.resolved);
  const closed = items.filter(i =>  i.resolved);
  const visible = filter==="open" ? open : filter==="resolved" ? closed : items;

  // Trend: compare open count vs a week ago isn't possible without history, so we show totals
  const critHigh = open.filter(i => i.severity==="critical" || i.severity==="high").length;

  if (!loaded) return <div style={{color:C.muted, fontFamily:"Space Mono, monospace", fontSize:12, padding:20}}>Loading…</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
        {[
          { label:"OPEN",      val:open.length,   color:C.coral },
          { label:"CRITICAL/HIGH", val:critHigh,  color:"#FF4A5A" },
          { label:"RESOLVED",  val:closed.length, color:C.teal },
          { label:"TOTAL",     val:items.length,  color:C.muted },
        ].map(s => (
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"14px 16px" }}>
            <div style={{ fontSize:24, fontWeight:700, color:s.color, fontFamily:"Space Mono, monospace", lineHeight:1 }}>
              {s.val}
            </div>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.1em", marginTop:4, fontFamily:"Space Mono, monospace" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6 }}>
          {(["open","resolved","all"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter===f ? C.faint : "transparent",
              border:`1px solid ${filter===f ? C.border2 : C.border}`,
              borderRadius:4, padding:"5px 12px",
              fontSize:11, fontFamily:"Space Mono, monospace",
              color: filter===f ? C.text : C.muted,
              cursor:"pointer", letterSpacing:"0.06em",
            }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <Btn onClick={() => setShowForm((v: boolean) => !v)} variant={showForm ? "ghost" : "primary"} small>
          {showForm ? "CANCEL" : "+ ADD ITEM"}
        </Btn>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:8, padding:"18px 20px",
          display:"flex", flexDirection:"column", gap:12,
          animation:"fadeUp 0.2s ease",
        }}>
          <div style={{ fontSize:11, fontFamily:"Space Mono, monospace", color:C.muted, letterSpacing:"0.08em" }}>ADD DEBT ITEM</div>
          <input
            value={form.title}
            onChange={e => setForm(f => ({...f, title:e.target.value}))}
            placeholder="What's the issue? Be specific."
            style={{
              background:C.surface, border:`1px solid ${C.border}`, borderRadius:6,
              padding:"10px 12px", color:C.text, fontSize:13,
              fontFamily:"DM Sans, sans-serif", outline:"none", width:"100%",
            }}
            onFocus={e => e.target.style.borderColor = C.sky}
            onBlur={e => e.target.style.borderColor = C.border}
            onKeyDown={e => e.key==="Enter" && add()}
          />
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({...f, notes:e.target.value}))}
            placeholder="Notes, context, reproduction steps… (optional)"
            style={{
              background:C.surface, border:`1px solid ${C.border}`, borderRadius:6,
              padding:"10px 12px", color:C.text, fontSize:13,
              fontFamily:"DM Sans, sans-serif", outline:"none", width:"100%",
              minHeight:70, resize:"vertical",
            }}
            onFocus={e => e.target.style.borderColor = C.sky}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <div style={{ display:"flex", gap:10 }}>
            <select
              value={form.severity}
              onChange={e => setForm(f => ({...f, severity:e.target.value}))}
              style={{
                flex:1, background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:6, padding:"8px 10px", color:C.text,
                fontSize:12, fontFamily:"Space Mono, monospace", outline:"none",
              }}
            >
              {Object.entries(SEV).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select
              value={form.category}
              onChange={e => setForm(f => ({...f, category:e.target.value}))}
              style={{
                flex:1, background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:6, padding:"8px 10px", color:C.text,
                fontSize:12, fontFamily:"Space Mono, monospace", outline:"none",
              }}
            >
              {Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <Btn onClick={add} disabled={!form.title.trim()} variant="teal">ADD</Btn>
          </div>
        </div>
      )}

      {/* Items list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {visible.length === 0 && (
          <div style={{ textAlign:"center", padding:"32px 0", color:C.muted, fontSize:13, fontFamily:"DM Sans, sans-serif" }}>
            {filter === "open" ? "No open items. Clean slate." : "Nothing here yet."}
          </div>
        )}
        {visible.map(item => {
          const sev = (SEV as any)[item.severity] || SEV.medium;
          const cat = (CATS as any)[item.category] || CATS.bug;
          const age = Math.floor((Date.now() - new Date(item.created).getTime()) / 86400000);
          return (
            <div key={item.id} style={{
              background: item.resolved ? "rgba(12,15,28,0.5)" : C.card,
              border:`1px solid ${item.resolved ? C.border : C.border2}`,
              borderLeft:`3px solid ${item.resolved ? C.muted : sev.color}`,
              borderRadius:8, padding:"14px 16px",
              opacity: item.resolved ? 0.55 : 1,
              transition:"all 0.2s",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <Tag label={sev.label} color={sev.color} bg={sev.bg} small />
                    <span style={{ fontSize:12, color:cat.color }}>{cat.icon} {cat.label}</span>
                    <span style={{ fontSize:11, color:C.muted, fontFamily:"Space Mono, monospace" }}>
                      {age === 0 ? "today" : `${age}d ago`}
                    </span>
                    {item.resolved && <Tag label="RESOLVED" color={C.teal} bg="rgba(0,185,142,0.08)" small />}
                  </div>
                  <div style={{ fontSize:14, color: item.resolved ? C.muted : C.text, fontFamily:"DM Sans, sans-serif", fontWeight:600, textDecoration: item.resolved ? "line-through" : "none" }}>
                    {item.title}
                  </div>
                  {item.notes && (
                    <div style={{ fontSize:12, color:C.muted, marginTop:5, lineHeight:1.5, fontFamily:"DM Sans, sans-serif" }}>
                      {item.notes}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {!item.resolved
                    ? <Btn small variant="teal" onClick={() => resolve(item.id)}>RESOLVE</Btn>
                    : <Btn small variant="ghost" onClick={() => reopen(item.id)}>REOPEN</Btn>
                  }
                  <Btn small variant="danger" onClick={() => remove(item.id)}>✕</Btn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DECISION LOG TAB ─────────────────────────────────────────────────────────
function DecisionsTab() {
  const [items, setItems]     = useState<any[]>([]);
  const [loaded, setLoaded]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]   = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState({ decision:"", context:"", alternatives:"", impact:"arch" });

  const IMPACTS: any = {
    arch:    { label:"Architecture", color:"#C084FC" },
    infra:   { label:"Infrastructure", color:C.sky },
    data:    { label:"Data/Quality",   color:"#F0B840" },
    process: { label:"Process",        color:C.teal },
    cost:    { label:"Cost",           color:C.coral },
  };

  useEffect(() => {
    load(DECISIONS_KEY, []).then(d => { setItems(d); setLoaded(true); });
  }, []);

  const persist = (next: any[]) => { setItems(next); save(DECISIONS_KEY, next); };

  const add = () => {
    if (!form.decision.trim()) return;
    persist([{
      id: Date.now(),
      decision: form.decision.trim(),
      context: form.context.trim(),
      alternatives: form.alternatives.trim(),
      impact: form.impact,
      date: new Date().toISOString(),
    }, ...items]);
    setForm({ decision:"", context:"", alternatives:"", impact:"arch" });
    setShowForm(false);
  };

  const filtered = items.filter(i =>
    !search || i.decision.toLowerCase().includes(search.toLowerCase()) ||
    i.context.toLowerCase().includes(search.toLowerCase())
  );

  if (!loaded) return <div style={{color:C.muted, fontFamily:"Space Mono, monospace", fontSize:12, padding:20}}>Loading…</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:C.text, fontFamily:"DM Sans, sans-serif" }}>
            Decision Log
          </div>
          <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
            {items.length} decision{items.length !== 1 ? "s" : ""} recorded · Ends re-litigation of settled calls
          </div>
        </div>
        <Btn onClick={() => setShowForm((v: boolean) => !v)} variant={showForm ? "ghost" : "primary"} small>
          {showForm ? "CANCEL" : "+ LOG DECISION"}
        </Btn>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderRadius:8, padding:"18px 20px",
          display:"flex", flexDirection:"column", gap:12,
          animation:"fadeUp 0.2s ease",
        }}>
          <div style={{ fontSize:11, fontFamily:"Space Mono, monospace", color:C.muted, letterSpacing:"0.08em" }}>LOG ARCHITECTURAL DECISION</div>

          <div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:5, fontFamily:"Space Mono, monospace" }}>DECISION *</div>
            <input
              value={form.decision}
              onChange={e => setForm(f => ({...f, decision:e.target.value}))}
              placeholder="What was decided? e.g. 'Use Outscraper as fallback enrichment, not primary'"
              style={{
                background:C.surface, border:`1px solid ${C.border}`, borderRadius:6,
                padding:"10px 12px", color:C.text, fontSize:13,
                fontFamily:"DM Sans, sans-serif", outline:"none", width:"100%",
              }}
              onFocus={e => e.target.style.borderColor = C.sky}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:5, fontFamily:"Space Mono, monospace" }}>WHY (context + rationale)</div>
            <textarea
              value={form.context}
              onChange={e => setForm(f => ({...f, context:e.target.value}))}
              placeholder="Why was this the right call? What evidence or constraints drove it?"
              style={{
                background:C.surface, border:`1px solid ${C.border}`, borderRadius:6,
                padding:"10px 12px", color:C.text, fontSize:13,
                fontFamily:"DM Sans, sans-serif", outline:"none", width:"100%",
                minHeight:70, resize:"vertical",
              }}
              onFocus={e => e.target.style.borderColor = C.sky}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:5, fontFamily:"Space Mono, monospace" }}>ALTERNATIVES REJECTED (optional)</div>
            <input
              value={form.alternatives}
              onChange={e => setForm(f => ({...f, alternatives:e.target.value}))}
              placeholder="What else was considered and why not? e.g. 'Gemini Batch — latency too high for MH timeline'"
              style={{
                background:C.surface, border:`1px solid ${C.border}`, borderRadius:6,
                padding:"10px 12px", color:C.text, fontSize:13,
                fontFamily:"DM Sans, sans-serif", outline:"none", width:"100%",
              }}
              onFocus={e => e.target.style.borderColor = C.sky}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <select
              value={form.impact}
              onChange={e => setForm(f => ({...f, impact:e.target.value}))}
              style={{
                flex:1, background:C.surface, border:`1px solid ${C.border}`,
                borderRadius:6, padding:"8px 10px", color:C.text,
                fontSize:12, fontFamily:"Space Mono, monospace", outline:"none",
              }}
            >
              {Object.entries(IMPACTS).map(([k,v]: any) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <Btn onClick={add} disabled={!form.decision.trim()} variant="teal">LOG IT</Btn>
          </div>
        </div>
      )}

      {/* Search */}
      {items.length > 3 && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search decisions…"
          style={{
            background:C.card, border:`1px solid ${C.border}`, borderRadius:6,
            padding:"9px 14px", color:C.text, fontSize:13,
            fontFamily:"DM Sans, sans-serif", outline:"none", width:"100%",
          }}
          onFocus={e => e.target.style.borderColor = C.sky}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      )}

      {/* Decision list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign:"center", padding:"40px 0", color:C.muted,
            fontSize:13, fontFamily:"DM Sans, sans-serif",
            border:`1px dashed ${C.border}`, borderRadius:8,
          }}>
            {items.length === 0
              ? "No decisions logged yet.\nEvery architectural call you make here ends the re-litigation cycle."
              : "No results."}
          </div>
        )}
        {filtered.map(item => {
          const imp = IMPACTS[item.impact] || IMPACTS.arch;
          const isOpen = expanded === item.id;
          const date = new Date(item.date).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"});
          return (
            <div key={item.id} style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderLeft:`3px solid ${imp.color}`,
              borderRadius:8, overflow:"hidden",
              transition:"border-color 0.15s",
            }}>
              <div
                onClick={() => setExpanded(isOpen ? null : item.id)}
                style={{
                  display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                  padding:"14px 16px", cursor:"pointer", gap:12,
                }}
              >
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5, flexWrap:"wrap" }}>
                    <Tag label={imp.label} color={imp.color} bg={`${imp.color}18`} small />
                    <span style={{ fontSize:11, color:C.muted, fontFamily:"Space Mono, monospace" }}>{date}</span>
                  </div>
                  <div style={{ fontSize:14, color:C.text, fontFamily:"DM Sans, sans-serif", fontWeight:600, lineHeight:1.4 }}>
                    {item.decision}
                  </div>
                </div>
                <span style={{ color:C.muted, fontSize:14, flexShrink:0, marginTop:2 }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>

              {isOpen && (
                <div style={{
                  padding:"0 16px 16px", borderTop:`1px solid ${C.border}`,
                  paddingTop:14, display:"flex", flexDirection:"column", gap:10,
                  animation:"fadeUp 0.15s ease",
                }}>
                  {item.context && (
                    <div>
                      <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.08em", marginBottom:5, fontFamily:"Space Mono, monospace" }}>WHY</div>
                      <div style={{ fontSize:13, color:C.text, lineHeight:1.6, fontFamily:"DM Sans, sans-serif" }}>{item.context}</div>
                    </div>
                  )}
                  {item.alternatives && (
                    <div>
                      <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.08em", marginBottom:5, fontFamily:"Space Mono, monospace" }}>ALTERNATIVES REJECTED</div>
                      <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, fontFamily:"DM Sans, sans-serif" }}>{item.alternatives}</div>
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <Btn small variant="danger" onClick={() => persist(items.filter(i => i.id !== item.id))}>DELETE</Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── COACH TAB ────────────────────────────────────────────────────────────────
function CoachTab() {
  const [input, setInput] = useState("");
  const [mode, setMode]   = useState("idle");
  const [result, setResult] = useState<any>(null);
  const [err, setErr]     = useState("");

  const SCORE: any = {
    1:{label:"HEALTHY",color:C.teal},2:{label:"WATCH",color:"#90D090"},
    3:{label:"CONCERN",color:"#F0B840"},4:{label:"CRITICAL",color:C.coral},5:{label:"ON FIRE",color:"#FF3A3A"},
  };

  const run = async () => {
    if (input.trim().length < 80) { setErr("Paste a session summary first."); return; }
    setErr(""); setMode("loading");
    try {
      const raw = await callAI(COACH_PROMPT, `Analyze:\n\n${input}`, 800);
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      setMode("result");
    } catch(e: any) { setErr(`Failed: ${e.message}`); setMode("idle"); }
  };

  const ScoreBar = ({ score }: { score: number }) => {
    const cfg = SCORE[score] || SCORE[3];
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <div style={{ display:"flex", gap:3 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              width:16, height:5, borderRadius:2,
              background: i<=score ? cfg.color : C.faint,
              boxShadow: i<=score ? `0 0 4px ${cfg.color}50` : "none",
            }}/>
          ))}
        </div>
        <Tag label={cfg.label} color={cfg.color} bg={`${cfg.color}15`} small />
      </div>
    );
  };

  if (mode === "loading") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"60px 0"}}>
      <div style={{width:40,height:40,border:`2px solid ${C.border}`,borderTopColor:C.coral,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <div style={{fontSize:12,color:C.muted,fontFamily:"Space Mono, monospace"}}>Running 6-dimension diagnostic…</div>
    </div>
  );

  if (mode === "result" && result) {
    const ov = SCORE[result.overall] || SCORE[3];
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeUp 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:24,fontWeight:700,color:ov.color,fontFamily:"Space Mono, monospace"}}>{ov.label}</div>
            <div style={{fontSize:13,color:C.text,fontFamily:"DM Sans, sans-serif",maxWidth:480,lineHeight:1.5}}>{result.summary}</div>
          </div>
          <Btn small variant="ghost" onClick={() => { setMode("idle"); setResult(null); }}>↩ RESET</Btn>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            { title:"DEADLINE", data:result.deadline, render:(d: any) => (
              <>
                {d.days != null && <div style={{fontSize:28,fontWeight:700,color:C.sky,fontFamily:"Space Mono, monospace",lineHeight:1,marginBottom:6}}>{d.days}d</div>}
                <div style={{fontSize:12,color:C.text,lineHeight:1.5,fontFamily:"DM Sans",marginBottom:8}}>{d.verdict}</div>
                {d.blockers?.map((b: string, i: number) => <div key={i} style={{fontSize:11,color:C.coral,padding:"3px 0",fontFamily:"DM Sans"}}>— {b}</div>)}
              </>
            )},
            { title:"BOTTLENECK", data:result.bottleneck, render:(d: any) => (
              <>
                <div style={{fontSize:13,color:C.coral,fontWeight:600,lineHeight:1.5,fontFamily:"DM Sans",marginBottom:8}}>{d.primary}</div>
                {d.others?.map((o: string, i: number) => <div key={i} style={{fontSize:11,color:C.muted,padding:"3px 0",fontFamily:"DM Sans"}}>— {o}</div>)}
              </>
            )},
            { title:"OPEN DEBT", data:result.debt, render:(d: any) => (
              <>
                <Tag label={`TREND: ${d.trend?.toUpperCase()}`} color={d.trend==="shrinking"?C.teal:d.trend==="growing"?C.coral:"#F0B840"} bg={`rgba(0,0,0,0.2)`} small />
                <div style={{height:8}}/>
                {d.items?.map((it: string, i: number) => <div key={i} style={{fontSize:11,color:C.text,padding:"3px 0",fontFamily:"DM Sans"}}>— {it}</div>)}
              </>
            )},
            { title:"WIP", data:result.wip, render:(d: any) => (
              <>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{fontSize:32,fontWeight:700,color:d.over?C.coral:C.teal,fontFamily:"Space Mono, monospace",lineHeight:1}}>{d.count}</div>
                  {d.over && <Tag label="OVER LIMIT" color={C.coral} bg="rgba(219,84,97,0.1)" small/>}
                </div>
                {d.streams?.slice(0,4).map((s: string, i: number) => <div key={i} style={{fontSize:11,color:C.muted,padding:"2px 0",fontFamily:"DM Sans"}}>· {s}</div>)}
              </>
            )},
          ].map(card => (
            <div key={card.title} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{fontSize:10,fontFamily:"Space Mono, monospace",color:C.muted,letterSpacing:"0.1em"}}>{card.title}</div>
                <ScoreBar score={card.data?.score}/>
              </div>
              {card.data && card.render(card.data)}
            </div>
          ))}
        </div>

        {result.next24 && (
          <div style={{background:"rgba(0,185,142,0.06)",border:`1px solid ${C.teal}25`,borderRadius:8,padding:"16px 18px"}}>
            <div style={{fontSize:10,fontFamily:"Space Mono, monospace",color:C.teal,letterSpacing:"0.1em",marginBottom:10}}>TOP PRIORITY — NEXT 24H</div>
            <div style={{fontSize:14,color:C.text,fontWeight:600,fontFamily:"DM Sans",marginBottom:6}}>{result.next24.action}</div>
            <div style={{fontSize:12,color:C.muted,fontFamily:"DM Sans",lineHeight:1.5,marginBottom:10}}>{result.next24.why}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {result.next24.avoid?.map((a: string, i: number) => <Tag key={i} label={`AVOID: ${a}`} color={C.coral} bg="rgba(219,84,97,0.08)" small/>)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div>
        <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:"DM Sans, sans-serif",marginBottom:4}}>Strategic Coach Diagnostic</div>
        <div style={{fontSize:12,color:C.muted}}>6-dimension health check. Paste session summary → honest analysis, no flattery.</div>
      </div>
      <textarea
        value={input} onChange={e => setInput(e.target.value)}
        placeholder="Paste session summary…"
        style={{
          width:"100%",minHeight:200,background:C.card,
          border:`1px solid ${C.border}`,borderRadius:8,
          padding:"14px 16px",color:C.text,fontSize:13,
          fontFamily:"DM Sans, sans-serif",lineHeight:1.6,
          resize:"vertical",outline:"none",
        }}
        onFocus={e => e.target.style.borderColor = C.sky}
        onBlur={e => e.target.style.borderColor = C.border}
      />
      {err && <div style={{fontSize:12,color:C.coral,fontFamily:"Space Mono, monospace"}}>{err}</div>}
      <Btn onClick={run} disabled={input.trim().length < 80}>RUN DIAGNOSTIC →</Btn>
    </div>
  );
}

// ─── PIPELINE SCORECARD TAB ──────────────────────────────────────────────────
// Admin key lives server-side only (server.js); the client authenticates as
// the logged-in Supabase user and the server-side proxy attaches the key.
async function mipAdminHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}
const POLL_MS = 5 * 60 * 1000;

interface WaterfallStage { label: string; count: number; pct: number }
interface BackfillData {
  completed_states: number; running_states: number; queued_states: number;
  processed: number; menus_found: number; captured: number;
}
interface HealthData {
  status: string; worker_count?: number; active_runs?: number;
  queued?: number;
}

function PipelineTab() {
  const [waterfall, setWaterfall]   = useState<WaterfallStage[]>([]);
  const [backfill, setBackfill]     = useState<BackfillData | null>(null);
  const [health, setHealth]         = useState<HealthData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState("");
  const [lastPoll, setLastPoll]     = useState<Date | null>(null);
  const [rate, setRate]             = useState<number | null>(null);
  const [menuArtifacts, setMenuArtifacts] = useState<number>(0);
  const prevRef = useRef<{ processed: number; time: number } | null>(null);

  const fetchAll = async () => {
    setErr("");
    const errors: string[] = [];

    // Health (fast ~1s) — isolated try/catch
    try {
      const hRes = await fetch(`/api/mip-proxy/health`, { headers: await mipAdminHeaders() });
      if (hRes.ok) {
        const hd = await hRes.json();
        setHealth({
          status: hd?.status ?? "unknown",
          worker_count: Number(hd?.worker_count) || 0,
          active_runs: Number(hd?.active_runs) || 0,
          queued: Number(hd?.queued) || 0,
        });
      } else {
        errors.push(`Health: ${hRes.status}`);
      }
    } catch (e: any) {
      errors.push(`Health: ${e?.message ?? "network error"}`);
    }

    // Show partial data immediately while snapshot loads
    setLoading(false);

    // Pipeline snapshot (slow ~45s) — waterfall + backfill in one call
    try {
      const sRes = await fetch(`/api/mip-proxy/pipeline-snapshot`, { headers: await mipAdminHeaders() });
      if (sRes.ok) {
        const snap = await sRes.json();

        // Waterfall from snapshot.waterfall
        const w = snap?.waterfall ?? {};
        const total = Number(w.total_canonical) || 0;
        if (total > 0) {
          setWaterfall([
            { label: "Total Canonical",  count: total,                            pct: 100 },
            { label: "Has URL",          count: Number(w.has_url) || 0,           pct: Number(w.has_url_pct) || 0 },
            { label: "Confirmed Live",   count: Number(w.confirmed_live) || 0,    pct: Number(w.confirmed_live_pct) || 0 },
            { label: "Validated Correct", count: Number(w.validated_correct) || 0, pct: Number(w.validated_correct_pct) || 0 },
            { label: "Has Menu",         count: Number(w.has_menu) || 0,          pct: Number(w.has_menu_pct) || 0 },
            { label: "Extracted",        count: Number(w.extracted) || 0,         pct: Number(w.extracted_pct) || 0 },
          ]);
          setMenuArtifacts(Number(w.menu_artifacts) || 0);
        }

        // Backfill from snapshot.backfill
        const b = snap?.backfill ?? {};
        const bd: BackfillData = {
          completed_states: Number(b.completed_states) || 0,
          running_states: Number(b.running_states) || 0,
          queued_states: Number(b.queued_states) || 0,
          processed: Number(b.processed) || 0,
          menus_found: Number(b.menus_found) || 0,
          captured: Number(b.captured) || 0,
        };
        setBackfill(bd);

        // Calculate rate using ref (avoids stale closure)
        const now = Date.now();
        const prev = prevRef.current;
        if (prev !== null) {
          const dt = (now - prev.time) / 3600000;
          if (dt > 0) setRate(Math.round((bd.processed - prev.processed) / dt));
        }
        prevRef.current = { processed: bd.processed, time: now };
      }
    } catch {
      // snapshot endpoint may be slow/down
    }

    setLastPoll(new Date());
    if (errors.length > 0) setErr(errors.join(" | "));
  };

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const pipelineStatus = () => {
    if (!health) return { label: "UNKNOWN", color: C.muted, icon: "⚪" };
    if (health.status !== "ok" && health.status !== "healthy")
      return { label: "STALLED", color: C.coral, icon: "🔴" };
    if (rate !== null && rate < 5)
      return { label: "SLOW", color: "#F0B840", icon: "🟡" };
    return { label: "ACTIVE", color: C.teal, icon: "🟢" };
  };

  const barColors = [C.sky, C.teal, "#C084FC", "#F0B840", C.coral, C.navy];

  if (loading) {
    return (
      <div style={{ textAlign:"center", padding:60, fontFamily:"Space Mono, monospace", color:C.muted }}>
        <div style={{ fontSize:24, marginBottom:16, animation:"spin 1s linear infinite", display:"inline-block" }}>⚙</div>
        <div style={{ fontSize:12, letterSpacing:"0.1em" }}>LOADING PIPELINE DATA…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ textAlign:"center", padding:60, fontFamily:"Space Mono, monospace" }}>
        <div style={{ fontSize:12, color:C.coral, marginBottom:8 }}>ERROR</div>
        <div style={{ fontSize:11, color:C.muted }}>{err}</div>
        <Btn onClick={fetchAll} small style={{ marginTop:16 }}>RETRY</Btn>
      </div>
    );
  }

  const status = pipelineStatus();
  const stateTotal = backfill ? (backfill.completed_states ?? 0) + (backfill.running_states ?? 0) + (backfill.queued_states ?? 0) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, animation:"fadeUp 0.3s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700, fontFamily:"Space Mono, monospace", letterSpacing:"0.05em" }}>
            PIPELINE SCORECARD
          </div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"DM Sans, sans-serif", marginTop:2 }}>
            Live MIP pipeline status — auto-refreshes every 5 min
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:12 }}>{status.icon}</span>
          <Tag label={status.label} color={status.color} bg={`${status.color}18`} />
          <Btn onClick={fetchAll} variant="ghost" small>↻ REFRESH</Btn>
        </div>
      </div>

      {/* ── Section 1: Pipeline Waterfall ── */}
      <div style={{
        background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:20,
      }}>
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", fontFamily:"Space Mono, monospace", marginBottom:16, color:C.sky }}>
          PIPELINE WATERFALL
        </div>
        {waterfall.length === 0 ? (
          <div style={{ fontSize:11, color:C.muted, fontFamily:"Space Mono, monospace", padding:20, textAlign:"center" }}>
            No backfill data available yet
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {waterfall.map((s, i) => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:160, fontSize:11, fontFamily:"DM Sans, sans-serif", color:C.text,
                  fontWeight:500, textAlign:"right", flexShrink:0,
                }}>{s.label}</div>
                <div style={{ flex:1, height:22, background:C.faint, borderRadius:4, overflow:"hidden", position:"relative" }}>
                  <div style={{
                    width:`${s.pct}%`, height:"100%",
                    background:`linear-gradient(90deg, ${barColors[i]}CC, ${barColors[i]}80)`,
                    borderRadius:4, transition:"width 0.6s ease",
                    minWidth: s.pct > 0 ? 2 : 0,
                  }}/>
                </div>
                <div style={{
                  width:80, fontSize:11, fontFamily:"Space Mono, monospace", color:C.text,
                  textAlign:"right", flexShrink:0,
                }}>
                  {(s.count ?? 0).toLocaleString()}
                </div>
                <div style={{
                  width:44, fontSize:10, fontFamily:"Space Mono, monospace",
                  color:C.muted, textAlign:"right", flexShrink:0,
                }}>
                  {s.pct ?? 0}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 2: Backfill Progress ── */}
      <div style={{
        background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:20,
      }}>
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", fontFamily:"Space Mono, monospace", marginBottom:16, color:C.teal }}>
          BACKFILL PROGRESS
        </div>
        {!backfill ? (
          <div style={{ fontSize:11, color:C.muted, fontFamily:"Space Mono, monospace", padding:20, textAlign:"center" }}>
            Backfill status endpoint unavailable
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Stacked progress bar */}
            <div style={{ height:28, borderRadius:4, overflow:"hidden", display:"flex", background:C.faint }}>
              {stateTotal > 0 && (
                <>
                  <div style={{
                    width:`${((backfill.completed_states ?? 0) / stateTotal) * 100}%`,
                    background:C.teal, transition:"width 0.6s",
                  }} title={`Completed: ${backfill.completed_states ?? 0} states`} />
                  <div style={{
                    width:`${((backfill.running_states ?? 0) / stateTotal) * 100}%`,
                    background:C.sky, transition:"width 0.6s",
                  }} title={`Running: ${backfill.running_states ?? 0} states`} />
                  <div style={{
                    width:`${((backfill.queued_states ?? 0) / stateTotal) * 100}%`,
                    background:C.muted, transition:"width 0.6s",
                  }} title={`Queued: ${backfill.queued_states ?? 0} states`} />
                </>
              )}
            </div>
            {/* Legend */}
            <div style={{ display:"flex", gap:18, fontSize:11, fontFamily:"Space Mono, monospace" }}>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Dot color={C.teal} /> <span style={{ color:C.text }}>{(backfill.completed_states ?? 0)} completed</span>
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Dot color={C.sky} pulse /> <span style={{ color:C.text }}>{(backfill.running_states ?? 0)} running</span>
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Dot color={C.muted} /> <span style={{ color:C.text }}>{(backfill.queued_states ?? 0)} queued</span>
              </span>
            </div>
            {/* Stats row */}
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12, marginTop:4,
            }}>
              {[
                { label:"PROCESSED", value:(backfill.processed ?? 0).toLocaleString(), color:C.text },
                { label:"MENUS FOUND", value:(backfill.menus_found ?? 0).toLocaleString(), color:C.teal },
                { label:"MENUS CAPTURED", value:(backfill.captured ?? 0).toLocaleString(), color:C.sky },
                { label:"VENUES/HR", value: rate !== null ? rate.toLocaleString() : "—", color: rate !== null && rate < 5 ? "#F0B840" : C.teal },
              ].map(s => (
                <div key={s.label} style={{
                  background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 12px",
                }}>
                  <div style={{ fontSize:9, letterSpacing:"0.1em", color:C.muted, fontFamily:"Space Mono, monospace", marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:18, fontWeight:700, fontFamily:"Space Mono, monospace", color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 3: Health Indicators ── */}
      <div style={{
        background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:20,
      }}>
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", fontFamily:"Space Mono, monospace", marginBottom:16, color:"#F0B840" }}>
          HEALTH INDICATORS
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
          {/* Workers */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:"0.1em", color:C.muted, fontFamily:"Space Mono, monospace", marginBottom:6 }}>WORKERS</div>
            <div style={{ fontSize:22, fontWeight:700, fontFamily:"Space Mono, monospace", color:C.sky }}>
              {health?.worker_count ?? "—"}
            </div>
            <div style={{ fontSize:10, color:C.muted, fontFamily:"DM Sans, sans-serif", marginTop:2 }}>
              {health?.active_runs ?? 0} active runs
            </div>
          </div>
          {/* Menu artifacts */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:"0.1em", color:C.muted, fontFamily:"Space Mono, monospace", marginBottom:6 }}>MENUS CAPTURED</div>
            <div style={{ fontSize:22, fontWeight:700, fontFamily:"Space Mono, monospace", color:C.teal }}>
              {menuArtifacts > 0 ? menuArtifacts.toLocaleString() : (backfill?.captured ?? 0).toLocaleString()}
            </div>
          </div>
          {/* Last updated */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:"0.1em", color:C.muted, fontFamily:"Space Mono, monospace", marginBottom:6 }}>LAST POLLED</div>
            <div style={{ fontSize:13, fontWeight:700, fontFamily:"Space Mono, monospace", color:C.text }}>
              {lastPoll ? lastPoll.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) : "—"}
            </div>
            <div style={{ fontSize:10, color:C.muted, fontFamily:"DM Sans, sans-serif", marginTop:2 }}>
              {lastPoll ? lastPoll.toLocaleDateString() : ""}
            </div>
          </div>
          {/* Pipeline status */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:"0.1em", color:C.muted, fontFamily:"Space Mono, monospace", marginBottom:6 }}>PIPELINE STATUS</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>{status.icon}</span>
              <span style={{ fontSize:15, fontWeight:700, fontFamily:"Space Mono, monospace", color:status.color }}>{status.label}</span>
            </div>
            <div style={{ fontSize:10, color:C.muted, fontFamily:"DM Sans, sans-serif", marginTop:4 }}>
              {status.label === "ACTIVE" && "Pipeline processing normally"}
              {status.label === "SLOW" && "Rate below threshold"}
              {status.label === "STALLED" && "Health check failing"}
              {status.label === "UNKNOWN" && "No health data available"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize:10, color:C.muted, fontFamily:"Space Mono, monospace", textAlign:"center", letterSpacing:"0.08em" }}>
        POLLING {MIP_API}/health + /api/admin/menu-capture-backfill/status EVERY 5 MIN
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function MIPOps() {
  const [tab, setTab] = useState("briefing");

  const TABS = [
    { id:"briefing",  label:"BRIEFING",    icon:"⚡", desc:"Session startup" },
    { id:"debt",      label:"DEBT",        icon:"🐛", desc:"Bug & debt tracker" },
    { id:"decisions", label:"DECISIONS",   icon:"📋", desc:"Decision log" },
    { id:"coach",     label:"COACH",       icon:"🎯", desc:"Strategic diagnostic" },
    { id:"pipeline",  label:"PIPELINE",    icon:"📊", desc:"Live scorecard" },
  ];

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text }}>
      <style>{FONTS}</style>

      {/* Top bar */}
      <div style={{
        borderBottom:`1px solid ${C.border}`,
        background:`linear-gradient(90deg, ${C.navy}CC 0%, ${C.bg} 60%)`,
        padding:"0 24px",
        display:"flex", alignItems:"stretch",
        justifyContent:"space-between",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, paddingRight:24, borderRight:`1px solid ${C.border}` }}>
          <div style={{
            width:32, height:32, borderRadius:6,
            background:`linear-gradient(135deg, ${C.navy}, ${C.teal}50)`,
            border:`1px solid ${C.teal}40`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
          }}>⚡</div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:C.text, fontFamily:"Space Mono, monospace" }}>
              MIP OPS
            </div>
            <div style={{ fontSize:10, color:C.muted, fontFamily:"Space Mono, monospace" }}>ED DOBBLES LLC</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", flex:1, paddingLeft:8 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background:"transparent",
                border:"none",
                borderBottom:`2px solid ${tab===t.id ? C.sky : "transparent"}`,
                padding:"16px 20px",
                color: tab===t.id ? C.sky : C.muted,
                cursor:"pointer",
                fontSize:11, fontWeight:700,
                letterSpacing:"0.1em",
                fontFamily:"Space Mono, monospace",
                transition:"all 0.15s",
                display:"flex", alignItems:"center", gap:7,
              }}
            >
              <span style={{ fontSize:14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Back to MIP link */}
        <div style={{ display:"flex", alignItems:"center", paddingLeft:16, gap:12 }}>
          <a
            href="/mip"
            style={{
              fontSize:11, color:C.muted,
              fontFamily:"Space Mono, monospace", fontWeight:700, letterSpacing:"0.08em",
              textDecoration:"none",
            }}
          >
            ← MIP
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"28px 24px" }}>
        {tab === "briefing"  && <BriefingTab />}
        {tab === "debt"      && <DebtTab />}
        {tab === "decisions" && <DecisionsTab />}
        {tab === "coach"     && <CoachTab />}
        {tab === "pipeline"  && <PipelineTab />}
      </div>
    </div>
  );
}
