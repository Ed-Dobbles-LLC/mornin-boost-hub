import { LaunchButtons } from "@/components/LaunchButtons";
import { MyTools } from "@/components/MyTools";
import { HeadlinesBox } from "@/components/HeadlinesBox";
import { BriefingBox } from "@/components/BriefingBox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, Globe, Wine } from "lucide-react";

export default function Hub() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    };
    updateGreeting();
    const iv = setInterval(updateGreeting, 60000);
    return () => clearInterval(iv);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hub header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-foreground">Dobbles</span>
            <span className="font-serif text-lg text-primary">.AI</span>
            <span className="font-sans text-xs text-muted-foreground ml-3 hidden md:block">/ Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/mip"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Wine className="w-4 h-4" /> MIP
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" /> Public site
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Hero greeting */}
      <div className="relative border-b border-border/60 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 50%, hsl(213 100% 12% / 0.3) 0%, transparent 70%)" }}
        />
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-1.5">
            {greeting}, Ed.
          </h1>
          <p className="font-sans text-sm text-muted-foreground">{dateStr}</p>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Daily Briefing — newsletters, summarized */}
        <div className="mb-6">
          <BriefingBox />
        </div>

        {/* Top Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <LaunchButtons />
          <MyTools />
        </div>

        {/* Headlines */}
        <div className="mb-6">
          <HeadlinesBox />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="font-sans text-xs text-muted-foreground">
            Dobbles.AI Hub · Private
          </p>
          <Link to="/" className="font-sans text-xs text-muted-foreground hover:text-primary transition-colors">
            View public site →
          </Link>
        </div>
      </footer>
    </div>
  );
}
