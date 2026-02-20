import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

export function SiteNav() {
  const location = useLocation();
  const { session } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="font-serif text-xl text-foreground tracking-tight">Dobbles</span>
          <span className="font-serif text-xl text-primary tracking-tight">.AI</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors ${
                  active
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        {session ? (
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium">
            <Link to="/hub">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Hub
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary font-sans font-medium">
            <Link to="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
