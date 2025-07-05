import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  category: string;
  description: string;
  ingredients: string;
  instructions: string;
  prep_time_min?: number;
  cook_time_min?: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const ingredientsList = recipe.ingredients.split(';');
  const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
  
  return (
    <Card className="shadow-soft hover:shadow-elevated transition-all duration-300 border-border/50">
      <div className="relative">
        <img 
          src={recipe.image_url} 
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop";
          }}
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-overproof-red text-white font-medium">
            <ChefHat size={14} className="mr-1" />
            {recipe.category}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl text-card-foreground font-semibold">{recipe.title}</CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">{recipe.description}</p>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-overproof-blue" />
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-overproof-blue" />
            <span>{recipe.calories} cal</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-card-foreground mb-2">Ingredients</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {ingredientsList.slice(0, 5).map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="text-overproof-red mr-2">•</span>
                {ingredient.trim()}
              </li>
            ))}
            {ingredientsList.length > 5 && (
              <li className="text-overproof-red font-medium">
                +{ingredientsList.length - 5} more ingredients
              </li>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-card-foreground mb-2">Nutrition</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted p-2 rounded">
              <span className="font-medium">{recipe.protein_g}g</span>
              <span className="text-muted-foreground ml-1">protein</span>
            </div>
            <div className="bg-muted p-2 rounded">
              <span className="font-medium">{recipe.fiber_g}g</span>
              <span className="text-muted-foreground ml-1">fiber</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};