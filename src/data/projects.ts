export interface Project {
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  status: "Live" | "Shipped" | "Building";
  problem: string;
  users: string;
  approach: string;
  outcomes: string[];
  roadmap: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "chat-to-snowflake",
    name: "Chat-to-Snowflake",
    tagline: "Natural language → instant Snowflake queries. No SQL required.",
    tags: ["Generative AI", "Data Platform", "NLP"],
    status: "Live",
    problem:
      "Enterprise analysts waited days for ad-hoc data pulls. The bottleneck was always the SQL-fluent data team — a scarce resource blocking a high-demand need.",
    users:
      "Beverage sales leaders, brand managers, and field reps — none of whom write SQL.",
    approach:
      "An LLM layer parses natural language intent, generates validated Snowflake SQL, executes it, and returns a formatted insight. Guardrails prevent runaway queries and enforce data governance.",
    outcomes: [
      "Analysis cycle compressed from days to minutes",
      "Self-serve adoption across non-technical commercial teams",
      "Established market-differentiating analytics offering at Overproof",
    ],
    roadmap: [
      "Conversational follow-up queries",
      "Automated visualization layer",
      "Multi-tenant SaaS pricing model",
    ],
  },
  {
    slug: "ai-content-engine",
    name: "AI Content Engine",
    tagline: "Full-stack automated content: curation → script → record → publish.",
    tags: ["Automation", "Generative AI", "Media"],
    status: "Live",
    problem:
      "Thought leadership content was expensive, slow, and required constant human orchestration — limiting publishing cadence and brand reach.",
    users: "Beverage intelligence platform building brand authority at scale.",
    approach:
      "Pipeline: automated news ingestion → LLM script generation → automated recording → publish. Zero manual intervention per episode once configured.",
    outcomes: [
      "Eliminated manual content production effort entirely",
      "Consistent high-cadence publishing at scale",
      "Differentiated brand positioning vs. competitors in beverage analytics",
    ],
    roadmap: [
      "Personalized content variants by audience segment",
      "Audience segmentation and targeting layer",
      "Sponsor insertion and monetization module",
    ],
  },
  {
    slug: "ml-forecasting",
    name: "ML Demand Forecasting",
    tagline: "5% accuracy lift. 60 hours/month returned to the team.",
    tags: ["Machine Learning", "Forecasting", "Supply Chain"],
    status: "Shipped",
    problem:
      "Manual forecasting at Diageo was labor-intensive, relied on rule-based heuristics, and left predictable accuracy improvements on the table at significant revenue scale.",
    users: "Supply chain planning, commercial leadership, and finance — Diageo North America.",
    approach:
      "Replaced rule-based models with an ML ensemble approach trained on historical sell-through, distribution data, and external signals. Automated data pipeline with drift monitoring.",
    outcomes: [
      "+5% forecast accuracy at $4B+ revenue scale",
      "60 hours/month of analyst effort reclaimed",
      "Fully integrated into production planning workflow",
    ],
    roadmap: [
      "Real-time adjustment model based on live POS data",
      "SKU-level granularity expansion",
      "Scenario planning UI for commercial leadership",
    ],
  },
  {
    slug: "distribution-optimizer",
    name: "Distribution Intelligence",
    tagline: "115,000 net-new distribution points. $64M–$120M incremental revenue.",
    tags: ["Predictive Modeling", "Sales Analytics", "Revenue"],
    status: "Shipped",
    problem:
      "Sales teams had no systematic way to prioritize which accounts to pursue for distribution expansion — effort was spread thin across low-probability targets.",
    users: "Field sales, regional directors, and VP Sales — Diageo North America.",
    approach:
      "Propensity model trained on outlet characteristics, competitive presence, category velocity, and historical success rates. Surfaced ranked opportunity lists by territory, updated weekly.",
    outcomes: [
      "115,000 net-new distribution points generated",
      "$64M–$120M in incremental annual revenue",
      "Represented 10% of total US growth for a $4B+ business unit",
    ],
    roadmap: [
      "White-label offering for other CPG companies",
      "Real-time outlet scoring via API",
    ],
  },
];
