import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HIGHLIGHTS = [
  "$64M–$120M incremental annual revenue from analytically-driven distribution program at Diageo North America",
  "$100M+ projected lifetime revenue from 220,000-client New Client Acquisition program at H&R Block",
  "$180M–$360M in annual revenue erosion prevented through strategic pricing discipline at H&R Block",
  "Built offshore analytics center from zero to 30 FTEs in 12 months at SuperValu — $4M in annual savings",
  "Doubled team engagement from 40% to 80% in one year through culture transformation at H&R Block",
  "Deployed generative AI + NLP solutions across a $4B+ commercial organization at Diageo",
];

const EDUCATION = [
  "Doctor of Business Administration · Rutgers University (Dissertation: Driving Adoption of Advanced Analytic Tools)",
  "MS Marketing / Market Research · University of Wisconsin–Madison (AC Nielsen Center)",
  "BA Advertising · Michigan State University",
  "Behavioral Economics Certificate · Harvard Business School",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6 pt-36 pb-8">
        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-primary mb-4">About</p>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-20">The Geek that can Speak</h1>

        <div className="grid md:grid-cols-[1fr_320px] gap-16 items-start">
          {/* Main narrative */}
          <div>
            <div className="space-y-5 font-sans text-base text-muted-foreground leading-relaxed mb-12">
              <p>
                I've spent 25 years at the intersection of data and business strategy — leading
                analytics functions at Diageo, H&R Block, SuperValu, and Best Buy, then stepping
                into the C-suite as Chief Analytics Officer at Overproof. The throughline across
                all of it: I build the capabilities that translate data into decisions that actually
                move the business.
              </p>
              <p>
                My reputation is "Geek that can Speak." I can sit in a board presentation and
                explain why a forecasting model improved accuracy 5% — and what that means for
                supply chain planning, working capital, and revenue. I can also sit with a data
                science team and talk architecture. That bridge is rare, and it's where I live.
              </p>
              <p>
                Now I'm building. AI is compressing the time from idea to working product faster
                than any prior technology shift I've seen. I'm treating that as an opportunity to
                ship practical tools — things that solve real business problems, not demos.
              </p>
            </div>

            <h3 className="font-serif text-2xl text-foreground mb-6">Career highlights</h3>
            <ul className="space-y-0">
              {HIGHLIGHTS.map((h, i) => (
                <li key={i} className="flex gap-4 py-4 border-b border-border font-sans text-sm text-muted-foreground leading-relaxed">
                  <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                  {h}
                </li>
              ))}
            </ul>

            <h3 className="font-serif text-2xl text-foreground mt-12 mb-6">Education</h3>
            <ul className="space-y-0">
              {EDUCATION.map((e, i) => (
                <li key={i} className="flex gap-4 py-4 border-b border-border font-sans text-sm text-muted-foreground leading-relaxed">
                  <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sticky top-24">
            {[
              {
                label: "Current",
                content: (
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    Chief Analytics Officer, Overproof — building analytics &amp; AI for beverage intelligence
                  </p>
                ),
              },
              {
                label: "Open to",
                content: (
                  <ul className="space-y-1.5 font-sans text-sm text-muted-foreground">
                    {["CAO / CDO / VP Analytics roles", "Advisory & board", "AI build collaboration", "Speaking engagements"].map((i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                label: "Stack",
                content: (
                  <ul className="space-y-1.5 font-sans text-sm text-muted-foreground">
                    {["Snowflake · SQL · Python", "R · Tableau · Power BI", "Generative AI / LLMs", "Low-code / No-code"].map((i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                label: "Location",
                content: <p className="font-sans text-sm text-muted-foreground">Minneapolis–St. Paul Metro</p>,
              },
            ].map((card) => (
              <div key={card.label} className="bg-card border border-border rounded-xl p-6">
                <p className="font-sans text-xs font-semibold tracking-widest uppercase text-primary mb-4">{card.label}</p>
                {card.content}
              </div>
            ))}

            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm hover:bg-primary/90 transition-colors mt-2"
            >
              Get in touch <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
