import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat } from "lucide-react";
import { useMemo } from 'react';

export type Recipe = {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  [key: string]: any; // for strIngredientN/strMeasureN
};

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const ingredients = useMemo(() => {
    const list: { ing: string; meas: string }[] = [];
    for (let i = 1; i <= 20; i++) {
      const ing = recipe[`strIngredient${i}`];
      const meas = recipe[`strMeasure${i}`];
      if (ing && ing.trim()) list.push({ ing, meas });
    }
    return list;
  }, [recipe]);

  return (
    <Card className="shadow-soft hover:shadow-elevated transition-all duration-300 border-border/50 h-full flex flex-col">
      <div className="relative">
        <img 
          src={recipe.strMealThumb} 
          alt={recipe.strMeal}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop";
          }}
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-dobbles-red text-white font-medium">
            <ChefHat size={14} className="mr-1" />
            {recipe.strCategory}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl text-card-foreground font-semibold">{recipe.strMeal}</CardTitle>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-dobbles-blue" />
            <span>{recipe.strArea} cuisine</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-dobbles-blue" />
            <span>{recipe.strCategory}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h4 className="font-semibold text-card-foreground mb-2">Instructions</h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
            {recipe.strInstructions}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-card-foreground mb-2">Ingredients</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {ingredients.slice(0, 6).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-dobbles-red mr-2">•</span>
                {item.meas} {item.ing}
              </li>
            ))}
            {ingredients.length > 6 && (
              <li className="text-dobbles-red font-medium">
                +{ingredients.length - 6} more ingredients
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};