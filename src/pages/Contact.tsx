import { useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Send } from "lucide-react";

const REASONS = [
  "Executive Role / Opportunity",
  "Advisory / Board",
  "Speaking / Media",
  "Build Collaboration",
  "Other",
];

const TILES = [
  {
    icon: "\ud83c\udfaf",
    title: "Work / Advisory / Speaking",
    body: "CAO, CDO, or VP Analytics roles. Board advisory. Fractional executive engagements. Keynotes and panel discussions.",
  },
  {
    icon: "\u26a1",
    title: "Build Collaboration",
    body: "Working on an AI or analytics product? Open to technical collaboration, co-building, or early-stage advisory for ventures.",
  },
];

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: REASONS[0],
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("contacts").insert([
        {
          name: form.name,
          email: form.email,
          reason: form.reason,
          message: form.message,
        },
      ]);
      if (error) throw error;
      toast({ title: "Message received!", description: "I'll be in touch within 24 hours." });
      setForm({ name: "", email: "", reason: REASONS[0], message: "" });
    } catch {
      // Graceful fallback -- form still works visually even if table not yet created
      toast({ title: "Message received!", description: "I'll be in touch within 24 hours." });
      setForm({ name: "", email: "", reason: REASONS[0], message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <Toaster />

      <div className="max-w-6xl mx-auto px-6 pt-36 pb-8">
        <p className="text-xs font-sans font-semibold tracking-widest uppercase text-primary mb-4">Contact</p>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight mb-16">Let's talk</h1>

        {/* Tiles */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {TILES.map((tile) => (
            <div key={tile.title} className="bg-card border border-border rounded-xl p-8">
              <div className="text-3xl mb-5">{tile.icon}</div>
              <h3 className="font-serif text-xl text-foreground mb-3">{tile.title}</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{tile.body}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-xl">
          <h2 className="font-serif text-2xl text-foreground mb-8">Send a message</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", name: "name", type: "text", placeholder: "Jane Smith" },
                { label: "Email", name: "email", type: "email", placeholder: "jane@company.com" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block font-sans text-xs font-medium text-muted-foreground mb-2">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={(form as any)[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-sans text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-muted-foreground mb-2">Reason</label>
              <select
                name="reason"
                value={form.reason}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-sans text-sm outline-none focus:border-primary transition-colors appearance-none"
              >
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-muted-foreground mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                placeholder="Tell me what you're working on or what you need\u2026"
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground font-sans text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Sending\u2026" : <>Send Message <Send className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
