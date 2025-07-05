import { LaunchButtons } from "@/components/LaunchButtons";
import { RecipeCarousel } from "@/components/RecipeCarousel";
import { VocabBox } from "@/components/VocabBox";
import { FactBox } from "@/components/FactBox";
import { mockVocabPairs, mockFacts } from "@/data/mockData";
import heroImage from "@/assets/morning-hero.jpg";
import { useState, useEffect } from "react";

const Index = () => {
  const [greeting, setGreeting] = useState("");

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
    const interval = setInterval(updateGreeting, 60000); // Update every minute
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
          <VocabBox vocabPairs={mockVocabPairs} />
        </div>

        {/* Facts Box - Full Width */}
        <div className="mb-8">
          <FactBox facts={mockFacts} />
        </div>

        {/* Recipe Section - Full Width */}
        <div>
          <RecipeCarousel />
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