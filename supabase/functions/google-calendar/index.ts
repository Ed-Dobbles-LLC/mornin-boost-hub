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

    // Get the request body to check for calendar ID
    let calendarId = 'primary'; // default to primary
    
    try {
      const body = await req.json();
      if (body.calendarId) {
        calendarId = body.calendarId;
      }
    } catch {
      // No body or invalid JSON, use default
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('timeMin', startOfDay.toISOString());
    url.searchParams.set('timeMax', endOfDay.toISOString());
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '10');

    console.log('Fetching calendar events:', {
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      url: url.toString()
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        calendarId
      });
      
      if (response.status === 403) {
        return new Response(
          JSON.stringify({
            error: 'CALENDAR_ACCESS_FORBIDDEN',
            message: 'Cannot access private calendar with API key. You need either a public calendar or OAuth 2.0 setup for private calendars.',
            events: [],
            date: today.toISOString().split('T')[0],
            calendarId
          }),
          {
            status: 200, // Return 200 to handle gracefully on frontend
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (response.status === 404) {
        return new Response(
          JSON.stringify({
            error: 'CALENDAR_NOT_FOUND',
            message: `Calendar '${calendarId}' not found or not accessible.`,
            events: [],
            date: today.toISOString().split('T')[0],
            calendarId
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`Calendar API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const events: CalendarEvent[] = data.items || [];
    
    console.log(`Successfully fetched ${events.length} events for calendar '${calendarId}'`);

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
        date: today.toISOString().split('T')[0],
        calendarId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in google-calendar function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'FUNCTION_ERROR',
        message: error.message,
        events: [],
        date: new Date().toISOString().split('T')[0]
      }),
      {
        status: 200, // Return 200 to handle gracefully on frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});