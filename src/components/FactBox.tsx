import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";

interface FactBoxProps {
  facts: string[];
}

export const FactBox = ({ facts }: FactBoxProps) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(
    Math.floor(Math.random() * facts.length)
  );

  const handleNextFact = () => {
    const nextIndex = Math.floor(Math.random() * facts.length);
    setCurrentFactIndex(nextIndex);
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
            {facts[currentFactIndex]}
          </p>
        </div>
        
        <Button 
          onClick={handleNextFact}
          className="w-full bg-overproof-blue text-white hover:scale-105 transition-transform font-medium"
        >
          <RefreshCw size={16} className="mr-2" />
          Next Fact
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          Fact {currentFactIndex + 1} of {facts.length}
        </div>
      </CardContent>
    </Card>
  );
};