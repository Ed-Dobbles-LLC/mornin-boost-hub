import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    if (!apiKey) {
      throw new Error('Google Calendar API key not configured');
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // For now, we'll use the primary calendar. In production, you might want to
    // specify a particular calendar ID or implement OAuth for private calendars
    const calendarId = 'primary';
    
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('timeMin', startOfDay.toISOString());
    url.searchParams.set('timeMax', endOfDay.toISOString());
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '10');

    console.log('Fetching calendar events for today:', {
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString()
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API error:', response.status, errorText);
      
      if (response.status === 403) {
        throw new Error('Calendar access forbidden. You may need to enable the Google Calendar API or set up OAuth for private calendars.');
      }
      
      throw new Error(`Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    
    const events: CalendarEvent[] = data.items || [];
    
    console.log(`Found ${events.length} events for today`);

    return new Response(
      JSON.stringify({
        events: events.map(event => ({
          id: event.id,
          summary: event.summary || 'Untitled',
          start: event.start,
          end: event.end,
          description: event.description,
          location: event.location
        })),
        date: today.toISOString().split('T')[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in google-calendar function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        events: [],
        date: new Date().toISOString().split('T')[0]
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});