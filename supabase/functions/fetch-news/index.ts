import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Article {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching news from The Guardian API...');
    
    // Use The Guardian's free API (no key required for basic access)
    const response = await fetch('https://content.guardianapis.com/search?order-by=newest&show-fields=headline,trailText,webUrl&page-size=6&api-key=test');
    
    if (!response.ok) {
      console.log('Guardian API failed, trying alternative source...');
      // Try alternative RSS feed
      const rssResponse = await fetch('https://rss.cnn.com/rss/edition.rss');
      if (!rssResponse.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }
      
      const xmlText = await rssResponse.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      const articles: Article[] = Array.from(items).slice(0, 6).map(item => {
        const title = item.querySelector('title')?.textContent || 'No title';
        const description = item.querySelector('description')?.textContent || 'No description';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        
        return {
          title: title.trim(),
          description: description.replace(/<[^>]*>/g, '').trim().substring(0, 200),
          url: link,
          publishedAt: pubDate,
          source: { name: 'CNN' }
        };
      });
      
      console.log(`Returning ${articles.length} articles from CNN RSS`);
      return new Response(
        JSON.stringify({
          articles,
          success: true,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const data = await response.json();
    console.log('Guardian API response received');
    
    if (!data.response || !data.response.results) {
      throw new Error('Invalid response format from Guardian API');
    }
    
    const articles: Article[] = data.response.results.map((item: any) => ({
      title: item.webTitle || 'No title',
      description: item.fields?.trailText || item.webTitle || 'No description available',
      url: item.webUrl || '#',
      publishedAt: item.webPublicationDate || new Date().toISOString(),
      source: { name: 'The Guardian' }
    }));

    console.log(`Returning ${articles.length} articles`);

    return new Response(
      JSON.stringify({
        articles,
        success: true,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Return fallback data with error information
    const fallbackArticles: Article[] = [
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
    ];

    return new Response(
      JSON.stringify({
        articles: fallbackArticles,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});