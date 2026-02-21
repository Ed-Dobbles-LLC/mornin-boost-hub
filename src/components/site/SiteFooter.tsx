import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <span className="text-base font-bold text-foreground">Dobbles</span>
          <span className="text-base font-bold text-primary">.AI</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ed Dobbles · Minneapolis–St. Paul
        </p>
        <div className="flex items-center gap-6 text-sm">
          <a
            href="https://linkedin.com/in/ed-dobbles"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
          <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
