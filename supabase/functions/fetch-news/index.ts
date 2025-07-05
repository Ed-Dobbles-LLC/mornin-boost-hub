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
    console.log('Fetching BBC News RSS feed...');
    
    // Fetch BBC News RSS feed
    const response = await fetch('https://feeds.bbci.co.uk/news/rss.xml');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }
    
    const xmlText = await response.text();
    console.log('RSS feed fetched successfully');
    
    // Parse XML using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Failed to parse RSS XML');
    }
    
    // Extract items from RSS
    const items = xmlDoc.querySelectorAll('item');
    console.log(`Found ${items.length} news items`);
    
    const articles: Article[] = Array.from(items).slice(0, 6).map(item => {
      const title = item.querySelector('title')?.textContent || 'No title';
      const description = item.querySelector('description')?.textContent || 'No description';
      const link = item.querySelector('link')?.textContent || '#';
      const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
      
      // Clean up description (remove HTML tags if any)
      const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
      
      return {
        title: title.trim(),
        description: cleanDescription.substring(0, 200) + (cleanDescription.length > 200 ? '...' : ''),
        url: link,
        publishedAt: pubDate,
        source: { name: 'BBC News' }
      };
    });

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