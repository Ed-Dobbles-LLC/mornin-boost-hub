import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  image: string;
  description: string;
  prep_time: string;
  cook_time: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
      <div className="relative">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop";
          }}
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-sunrise text-white">
            <ChefHat size={14} className="mr-1" />
            Healthy
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl text-card-foreground">{recipe.title}</CardTitle>
        <p className="text-muted-foreground text-sm">{recipe.description}</p>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prep_time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-card-foreground mb-2">Ingredients</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                {ingredient}
              </li>
            ))}
            {recipe.ingredients.length > 5 && (
              <li className="text-primary font-medium">
                +{recipe.ingredients.length - 5} more ingredients
              </li>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-card-foreground mb-2">Nutrition</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted p-2 rounded">
              <span className="font-medium">{recipe.nutrition.calories}</span>
              <span className="text-muted-foreground ml-1">cal</span>
            </div>
            <div className="bg-muted p-2 rounded">
              <span className="font-medium">{recipe.nutrition.protein}</span>
              <span className="text-muted-foreground ml-1">protein</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};