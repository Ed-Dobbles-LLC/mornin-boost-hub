import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { Send, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  const state = location.state as { from?: { pathname: string } } | null;
  const from = state?.from?.pathname || "/hub";

  // If already logged in, redirect
  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/hub`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Back to site */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to site
      </Link>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-0.5">
            <span className="font-serif text-3xl text-foreground">Dobbles</span>
            <span className="font-serif text-3xl text-primary">.AI</span>
          </Link>
          <p className="font-sans text-sm text-muted-foreground mt-2">
            Morning Productivity Hub · Private Access
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          {!sent ? (
            <>
              <h1 className="font-serif text-2xl text-foreground mb-1">Sign in</h1>
              <p className="font-sans text-sm text-muted-foreground mb-8">
                Enter your email — we'll send a magic link. No password required.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ed@dobbles.ai"
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-lg bg-background border border-border text-foreground font-sans text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                />

                {error && (
                  <p className="font-sans text-xs text-destructive">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending…" : <>Send Magic Link <Send className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="font-sans text-xs text-muted-foreground text-center mt-6">
                Access is restricted to authorized users only.
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
                <span className="text-primary text-xl">✓</span>
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">Check your email</h2>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                A sign-in link has been sent to <strong className="text-foreground">{email}</strong>.
                Click it to access your hub.
              </p>
              <button
                onClick={() => setSent(false)}
                className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors mt-6"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
