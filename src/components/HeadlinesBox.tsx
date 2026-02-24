import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export const HeadlinesBox = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeadlines = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching headlines from edge function...');
      
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        console.error('News function error:', error);
        setError('Failed to load headlines');
        return;
      }

      console.log('News data received:', data);
      
      if (data.success) {
        setArticles(data.articles);
      } else {
        setError('News service temporarily unavailable');
        setArticles(data.articles); // Use fallback articles
      }
    } catch (err) {
      console.error('Error fetching headlines:', err);
      setError('Failed to load headlines');
      // Fallback mock data
      setArticles([
        {
          title: "Breaking: Latest World News Update",
          description: "Stay informed with the latest breaking news from around the world.",
          url: "https://www.bbc.com/news",
          publishedAt: new Date().toISOString(),
          source: { name: 'BBC News' }
        },
        {
          title: "Technology Advances Continue",
          description: "New developments in technology are shaping the future.",
          url: "https://www.bbc.com/news/technology",
          publishedAt: new Date().toISOString(),
          source: { name: 'BBC News' }
        },
        {
          title: "Global Economic Updates",
          description: "Markets react to latest economic indicators and policy changes.",
          url: "https://www.bbc.com/news/business",
          publishedAt: new Date().toISOString(),
          source: { name: 'BBC News' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadlines();
    const interval = setInterval(fetchHeadlines, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Card className="shadow-soft border-border/50 h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-card-foreground font-semibold flex items-center gap-2">
            <Newspaper className="text-primary" size={24} />
            Latest Headlines
          </CardTitle>
          <Button 
            onClick={fetchHeadlines}
            disabled={loading}
            size="sm"
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="bg-gradient-subtle p-6 rounded-lg border border-border/30 text-center">
              <p className="text-muted-foreground">Loading latest headlines...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-subtle p-6 rounded-lg border border-border/30 text-center">
              <p className="text-destructive mb-2">⚠️ {error}</p>
              <p className="text-sm text-muted-foreground">Showing fallback news</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {articles.map((article, index) => (
                <div 
                  key={index}
                  className="bg-gradient-subtle p-4 rounded-lg border border-border/30 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground mb-2 line-clamp-2">
                        {article.title}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {article.source.name} • {formatTime(article.publishedAt)}
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-accent/80 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          Powered by Hacker News API
        </div>
      </CardContent>
    </Card>
  );
};