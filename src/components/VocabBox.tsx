import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Vocab = { spanish: string; english: string };

export const VocabBox = () => {
  const [vocabPairs, setVocabPairs] = useState<Vocab[]>([]);
  const [current, setCurrent] = useState<Vocab | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVocabulary = async () => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('spanish, english');
      
      if (error) throw error;
      
      setVocabPairs(data || []);
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setCurrent(data[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const getRandom = (): Vocab => {
    if (vocabPairs.length === 0) return { spanish: '', english: '' };
    return vocabPairs[Math.floor(Math.random() * vocabPairs.length)];
  };

  const handleNext = () => {
    if (vocabPairs.length === 0) return;
    let next = getRandom();
    if (vocabPairs.length > 1 && current) {
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
          {loading ? (
            <p className="text-lg text-muted-foreground">Loading vocabulary...</p>
          ) : current ? (
            <>
              <p className="text-2xl font-bold text-card-foreground mb-2">{current.spanish}</p>
              <p className="text-lg text-muted-foreground">{current.english}</p>
            </>
          ) : (
            <p className="text-lg text-muted-foreground">No vocabulary available</p>
          )}
        </div>
        
        <Button 
          onClick={handleNext}
          disabled={loading || vocabPairs.length === 0}
          className="w-full bg-overproof-blue text-white hover:scale-105 transition-transform font-medium disabled:opacity-50"
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