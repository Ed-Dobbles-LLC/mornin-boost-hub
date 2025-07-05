import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface CalendarData {
  events: CalendarEvent[];
  date: string;
  error?: string;
}

export const CalendarBox = () => {
  const [calendarData, setCalendarData] = useState<CalendarData>({ events: [], date: '' });
  const [loading, setLoading] = useState(true);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching calendar events...');
      
      const { data, error } = await supabase.functions.invoke('google-calendar');
      
      if (error) {
        console.error('Calendar function error:', error);
        setCalendarData({ 
          events: [], 
          date: new Date().toISOString().split('T')[0], 
          error: `Function error: ${error.message || 'Unknown error'}` 
        });
        return;
      }

      console.log('Calendar data received:', data);
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar:', error);
      setCalendarData({ 
        events: [], 
        date: new Date().toISOString().split('T')[0], 
        error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const formatTime = (dateTime?: string, date?: string) => {
    if (dateTime) {
      return new Date(dateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    if (date) {
      return 'All day';
    }
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-card-foreground font-semibold flex items-center gap-2">
            <Calendar className="text-overproof-red" size={24} />
            Today's Schedule
          </CardTitle>
          <Button 
            onClick={fetchCalendarEvents}
            disabled={loading}
            size="sm"
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {calendarData.date && (
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(calendarData.date)}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="bg-gradient-subtle p-6 rounded-lg border border-border/30 text-center">
              <p className="text-muted-foreground">Loading calendar events...</p>
            </div>
          ) : calendarData.error ? (
            <div className="bg-gradient-subtle p-6 rounded-lg border border-border/30 text-center">
              <p className="text-destructive mb-2">⚠️ {calendarData.error}</p>
              <p className="text-sm text-muted-foreground">
                Make sure Google Calendar API is enabled and configured properly.
              </p>
            </div>
          ) : calendarData.events.length === 0 ? (
            <div className="bg-gradient-subtle p-6 rounded-lg border border-border/30 text-center">
              <p className="text-muted-foreground">📅 No events scheduled for today</p>
              <p className="text-sm text-muted-foreground mt-2">Enjoy your free day!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {calendarData.events.map((event) => (
                <div 
                  key={event.id}
                  className="bg-gradient-subtle p-4 rounded-lg border border-border/30 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground mb-1">
                        {event.summary}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            {formatTime(event.start.dateTime, event.start.date)}
                            {event.end && event.start.dateTime && event.end.dateTime && 
                              ` - ${formatTime(event.end.dateTime)}`
                            }
                          </span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="truncate max-w-40">{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          Powered by Google Calendar API
        </div>
      </CardContent>
    </Card>
  );
};