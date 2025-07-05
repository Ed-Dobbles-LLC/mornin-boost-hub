import { useState, useEffect } from "react";
import { RecipeCard } from "./RecipeCard";
import { mockRecipes } from "@/data/mockData";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Pause, SkipForward } from "lucide-react";

export const RecipeCarousel = () => {
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentRecipeIndex((prev) => (prev + 1) % mockRecipes.length);
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentRecipeIndex((prev) => (prev + 1) % mockRecipes.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentRecipe = mockRecipes[currentRecipeIndex];

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-soft border-border/50">
        <CardHeader className="pb-2 px-0">
          <CardTitle className="text-xl text-card-foreground font-semibold flex items-center justify-between">
            Healthy Recipe of the Moment
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={togglePlayPause} className="hover:bg-overproof-red hover:text-white transition-colors">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} className="hover:bg-overproof-blue hover:text-white transition-colors">
                <SkipForward size={16} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      
      <RecipeCard recipe={currentRecipe} />
      
      <div className="text-center text-sm text-muted-foreground">
        Recipe {currentRecipeIndex + 1} of {mockRecipes.length}
        {isPlaying && " • Auto-rotating every 20s"}
      </div>
    </div>
  );
};