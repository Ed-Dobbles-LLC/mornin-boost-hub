import { LaunchButtons } from "@/components/LaunchButtons";
import { RecipeCard, Recipe } from "@/components/RecipeCard";
import { VocabBox } from "@/components/VocabBox";
import { FactBox, FactBoxRef } from "@/components/FactBox";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/morning-hero.jpg";
import { useState, useEffect, useRef } from "react";

// pick from these healthy categories
const CATEGORIES = ['Vegetarian', 'Vegan', 'Seafood'];

const Index = () => {
  const [greeting, setGreeting] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const factBoxRef = useRef<FactBoxRef>(null);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecipe = async () => {
    try {
      const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const listRes = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`
      );
      const { meals } = await listRes.json();
      const pick = meals[Math.floor(Math.random() * meals.length)];
      const detailRes = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${pick.idMeal}`
      );
      const { meals: full } = await detailRes.json();
      setRecipe(full[0]);
    } catch (e) {
      console.error('Failed to fetch recipe', e);
    }
  };

  useEffect(() => {
    fetchRecipe();
    const interval = setInterval(fetchRecipe, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Overproof Header Section */}
      <div className="relative h-40 bg-gradient-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-overproof-navy via-overproof-blue to-overproof-navy"></div>
        <img 
          src={heroImage} 
          alt="Morning sunrise" 
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl px-6">
            <h1 className="text-4xl font-semibold mb-3">{greeting}</h1>
            <p className="text-xl opacity-90 font-medium">Ready to power better decisions?</p>
            <div className="mt-4 inline-block bg-overproof-red px-4 py-2 rounded-full text-sm font-medium">
              Your Productive Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Top Row - Launch Buttons and Vocabulary (Same Size) */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <LaunchButtons />
          <VocabBox />
        </div>

        {/* Middle Row - Recipe and Facts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-card-foreground">
                Healthy Recipe
              </h2>
              <Button onClick={fetchRecipe} className="bg-overproof-blue text-white hover:scale-105 transition-transform">
                Next Recipe
              </Button>
            </div>
            {recipe ? (
              <RecipeCard recipe={recipe} />
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <p className="text-muted-foreground">Loading recipe...</p>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-card-foreground">
                Random Facts
              </h2>
              <Button 
                onClick={() => factBoxRef.current?.fetchFact()} 
                className="bg-overproof-blue text-white hover:scale-105 transition-transform"
              >
                Next Fact
              </Button>
            </div>
            <FactBox ref={factBoxRef} />
          </div>
        </div>

        {/* BBC News Link */}
        <div className="mb-8 text-center">
          <a 
            href="https://www.bbc.com/news" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-overproof-blue text-white rounded-lg hover:scale-105 transition-transform font-medium"
          >
            📰 BBC Headline News
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-card shadow-soft border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p className="text-sm font-medium">
            Your personalized dashboard • Designed for productivity
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;