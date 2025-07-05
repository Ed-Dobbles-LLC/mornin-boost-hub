import { LaunchButtons } from "@/components/LaunchButtons";
import { RecipeCarousel } from "@/components/RecipeCarousel";
import { VocabBox } from "@/components/VocabBox";
import { FactBox } from "@/components/FactBox";
import { mockVocabPairs, mockFacts } from "@/data/mockData";
import heroImage from "@/assets/morning-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative h-32 bg-gradient-sunrise overflow-hidden">
        <img 
          src={heroImage} 
          alt="Morning sunrise" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Good Morning! ☀️</h1>
            <p className="text-lg opacity-90">Ready to start your productive day?</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <LaunchButtons />
            <RecipeCarousel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <VocabBox vocabPairs={mockVocabPairs} />
            <FactBox facts={mockFacts} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-card shadow-soft">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p className="text-sm">
            Your personalized morning dashboard • Built with ❤️ using React & Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;