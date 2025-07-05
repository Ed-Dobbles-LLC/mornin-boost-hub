import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export interface FactBoxRef {
  fetchFact: () => void;
}

export const FactBox = forwardRef<FactBoxRef>((props, ref) => {
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

  useImperativeHandle(ref, () => ({
    fetchFact
  }));

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
      
      <CardContent>
        <div className="bg-gradient-subtle p-6 rounded-lg min-h-[120px] flex items-center border border-border/30">
          <p className="text-card-foreground leading-relaxed">
            {loading ? "Loading an interesting fact..." : fact}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});