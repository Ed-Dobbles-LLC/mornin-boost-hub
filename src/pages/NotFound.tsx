import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
