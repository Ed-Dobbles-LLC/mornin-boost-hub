import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, Volume2 } from "lucide-react";

interface VocabPair {
  spanish: string;
  english: string;
  pronunciation?: string;
}

interface VocabBoxProps {
  vocabPairs: VocabPair[];
}

export const VocabBox = ({ vocabPairs }: VocabBoxProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(false);

  const currentPair = vocabPairs[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vocabPairs.length);
    setShowEnglish(false);
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * vocabPairs.length);
    setCurrentIndex(randomIndex);
    setShowEnglish(false);
  };

  const handleReveal = () => {
    setShowEnglish(!showEnglish);
  };

  const speakSpanish = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPair.spanish);
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-card-foreground font-semibold flex items-center justify-between">
          Spanish Vocabulary
          <Button variant="outline" size="sm" onClick={handleShuffle} className="hover:bg-overproof-red hover:text-white transition-colors">
            <Shuffle size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="bg-gradient-subtle p-6 rounded-lg border border-border/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-2xl font-semibold text-overproof-navy">{currentPair.spanish}</h3>
              <Button variant="ghost" size="sm" onClick={speakSpanish} className="hover:bg-overproof-red hover:text-white">
                <Volume2 size={16} />
              </Button>
            </div>
            {currentPair.pronunciation && (
              <p className="text-sm text-muted-foreground italic">
                [{currentPair.pronunciation}]
              </p>
            )}
          </div>
          
          <div className="min-h-[60px] flex items-center justify-center">
            {showEnglish ? (
              <div className="bg-overproof-blue p-4 rounded-lg text-white">
                <p className="text-lg font-semibold">{currentPair.english}</p>
              </div>
            ) : (
              <Button 
                onClick={handleReveal}
                className="bg-gradient-brand text-white hover:scale-105 transition-transform font-medium"
              >
                Reveal Translation
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleNext} 
            className="flex-1 bg-overproof-red text-white hover:scale-105 transition-transform font-medium"
          >
            Next Word
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          {currentIndex + 1} of {vocabPairs.length}
        </div>
      </CardContent>
    </Card>
  );
};