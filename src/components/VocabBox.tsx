import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Languages } from "lucide-react";

type Vocab = { spanish: string; english: string };

interface VocabBoxProps {
  vocabPairs: Vocab[];
}

export const VocabBox = ({ vocabPairs }: VocabBoxProps) => {
  const getRandom = (): Vocab =>
    vocabPairs[Math.floor(Math.random() * vocabPairs.length)];
  
  const [current, setCurrent] = useState<Vocab>(getRandom());

  const handleNext = () => {
    let next = getRandom();
    if (vocabPairs.length > 1) {
      while (next.spanish === current.spanish) next = getRandom();
    }
    setCurrent(next);
  };

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-card-foreground font-semibold flex items-center gap-2">
          <Languages className="text-overproof-red" size={24} />
          Spanish Vocabulary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gradient-subtle p-6 rounded-lg min-h-[120px] flex flex-col justify-center border border-border/30">
          <p className="text-2xl font-bold text-card-foreground mb-2">{current.spanish}</p>
          <p className="text-lg text-muted-foreground">{current.english}</p>
        </div>
        
        <Button 
          onClick={handleNext}
          className="w-full bg-overproof-blue text-white hover:scale-105 transition-transform font-medium"
        >
          <RefreshCw size={16} className="mr-2" />
          Next Word
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          {vocabPairs.length} words available
        </div>
      </CardContent>
    </Card>
  );
};