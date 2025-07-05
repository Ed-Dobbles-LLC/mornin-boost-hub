import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";

export const FactBox = () => {
  const [fact, setFact] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchFact = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
      const data = await response.json();
      setFact(data.text);
    } catch (error) {
      console.error('Error fetching fact:', error);
      setFact("Did you know? A group of flamingos is called a flamboyance!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

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
            {loading ? "Loading an interesting fact..." : fact}
          </p>
        </div>
        
        <Button 
          onClick={fetchFact}
          disabled={loading}
          className="w-full bg-overproof-blue text-white hover:scale-105 transition-transform font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className="mr-2" />
          Next Fact
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          Powered by useless facts API
        </div>
      </CardContent>
    </Card>
  );
};