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
    console.log('Fetching news from Hacker News API...');
    
    // Use Hacker News API which is reliable and has no CORS issues
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    
    if (!topStoriesResponse.ok) {
      throw new Error(`Failed to fetch top stories: ${topStoriesResponse.status}`);
    }
    
    const topStories = await topStoriesResponse.json();
    const storyIds = topStories.slice(0, 6); // Get top 6 stories
    
    // Fetch details for each story
    const articles: Article[] = [];
    
    for (const id of storyIds) {
      try {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (storyResponse.ok) {
          const story = await storyResponse.json();
          if (story && story.title) {
            articles.push({
              title: story.title,
              description: story.text ? story.text.substring(0, 200).replace(/<[^>]*>/g, '') + '...' : 'Latest tech and startup news from Hacker News',
              url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
              publishedAt: new Date(story.time * 1000).toISOString(),
              source: { name: 'Hacker News' }
            });
          }
        }
      } catch (error) {
        console.log(`Failed to fetch story ${id}:`, error);
      }
    }

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