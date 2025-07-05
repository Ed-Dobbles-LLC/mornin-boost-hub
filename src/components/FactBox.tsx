import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";

const facts = [
  'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
  'Bananas are berries, but strawberries aren\'t. Botanically speaking, berries must have seeds inside their flesh.',
  'Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, while the third pumps blood to the rest of the body.',
  'There are more trees on Earth than stars in the Milky Way galaxy. Scientists estimate there are about 3 trillion trees on Earth.',
  'A day on Venus is longer than a year on Venus. Venus rotates so slowly that it takes 243 Earth days to complete one rotation.',
  'The human brain uses about 20% of the body\'s total energy, despite only weighing about 2% of body weight.',
  'A group of flamingos is called a "flamboyance". They get their pink color from eating shrimp and algae.',
  'Dolphins have names for each other. They develop unique whistle signatures that other dolphins use to call them.',
];

export const FactBox = () => {
  const [fact, setFact] = useState(
    facts[Math.floor(Math.random() * facts.length)]
  );

  const nextFact = () => {
    let newFact = facts[Math.floor(Math.random() * facts.length)];
    // Ensure we don't show the same fact twice
    while (newFact === fact && facts.length > 1) {
      newFact = facts[Math.floor(Math.random() * facts.length)];
    }
    setFact(newFact);
  };

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-card-foreground font-semibold flex items-center gap-2">
          <Lightbulb className="text-overproof-red" size={24} />
          Random Facts
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gradient-subtle p-6 rounded-lg min-h-[120px] flex items-center border border-border/30">
          <p className="text-card-foreground leading-relaxed">
            {fact}
          </p>
        </div>
        
        <Button 
          onClick={nextFact}
          className="w-full bg-overproof-blue text-white hover:scale-105 transition-transform font-medium"
        >
          <RefreshCw size={16} className="mr-2" />
          Next Fact
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          {facts.length} facts available
        </div>
      </CardContent>
    </Card>
  );
};