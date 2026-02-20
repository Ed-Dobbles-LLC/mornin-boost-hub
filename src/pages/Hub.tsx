import { LaunchButtons } from "@/components/LaunchButtons";
import { RecipeCard, Recipe } from "@/components/RecipeCard";
import { VocabBox } from "@/components/VocabBox";
import { FactBox, FactBoxRef } from "@/components/FactBox";
import { HeadlinesBox } from "@/components/HeadlinesBox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LogOut, Globe } from "lucide-react";

const CATEGORIES = ["Vegetarian", "Vegan", "Seafood"];

export default function Hub() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const factBoxRef = useRef<FactBoxRef>(null);

  useEffect(() => {
    const updateGreeting = () => {
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    };
    updateGreeting();
    const iv = setInterval(updateGreeting, 60000);
    return () => clearInterval(iv);
  }, []);

  const fetchRecipe = async () => {
    try {
      const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const listRes = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
      const { meals } = await listRes.json();
      const pick = meals[Math.floor(Math.random() * meals.length)];
      const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${pick.idMeal}`);
      const { meals: full } = await detailRes.json();
      setRecipe(full[0]);
    } catch (e) {
      console.error("Failed to fetch recipe", e);
    }
  };

  useEffect(() => {
    fetchRecipe();
    const iv = setInterval(fetchRecipe, 20000);
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
        {/* Top Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <LaunchButtons />
          <VocabBox />
        </div>

        {/* Middle Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6 items-stretch">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl text-foreground">Healthy Recipe</h2>
              <Button
                onClick={fetchRecipe}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
              >
                Next Recipe
              </Button>
            </div>
            <div className="flex-1">
              {recipe ? (
                <RecipeCard recipe={recipe} />
              ) : (
                <div className="flex items-center justify-center h-full bg-card border border-border rounded-xl min-h-80">
                  <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading recipe&hellip;
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5 flex flex-col">
            <div className="flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-xl text-foreground">Random Facts</h2>
                <Button
                  onClick={() => factBoxRef.current?.fetchFact()}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
                >
                  Next Fact
                </Button>
              </div>
              <FactBox ref={factBoxRef} />
            </div>
            <div className="flex-1">
              <HeadlinesBox />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="font-sans text-xs text-muted-foreground">
            Dobbles.AI Hub &middot; Private
          </p>
          <Link to="/" className="font-sans text-xs text-muted-foreground hover:text-primary transition-colors">
            View public site &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
