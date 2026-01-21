import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, MapPin, Phone, Mail, CheckSquare, RefreshCw } from "lucide-react";
import type { Activity, Lead, ActivityType } from "@/data/mockData";
import { formatDateTime } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { MonthCalendar, CalendarEvent } from "@/components/ui/month-calendar";

interface LeadCalendarViewProps {
  activities: Activity[];
  leads: Lead[];
  onActivityClick: (activity: Activity) => void;
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  physical_meeting: MapPin,
  virtual_meeting: Video,
  call: Phone,
  email: Mail,
  task: CheckSquare,
  follow_up: RefreshCw,
};

const activityColors: Record<ActivityType, string> = {
  physical_meeting: "bg-primary/20 text-primary border-primary/30",
  virtual_meeting: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  call: "bg-success/20 text-success border-success/30",
  email: "bg-warning/20 text-warning border-warning/30",
  task: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400",
  follow_up: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400",
};

export function LeadCalendarView({ activities, leads, onActivityClick }: LeadCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Convert activities to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      date: new Date(activity.scheduledAt),
      type: activity.type,
    }));
  }, [activities]);

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    activities.forEach((activity) => {
      const dateKey = new Date(activity.scheduledAt).toDateString();
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, activity]);
    });
    return map;
  }, [activities]);

  const selectedDateActivities = useMemo(() => {
    return activitiesByDate.get(selectedDate.toDateString()) || [];
  }, [activitiesByDate, selectedDate]);

  const getLeadForActivity = (activity: Activity) => {
    return leads.find((lead) => lead.id === activity.clientId);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Calendar */}
      <Card className="xl:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Activity Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthCalendar
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date || new Date())}
            events={calendarEvents}
            onEventClick={(event) => {
              const activity = activities.find(a => a.id === event.id);
              if (activity) onActivityClick(activity);
            }}
            maxEventsPerDay={3}
          />
        </CardContent>
      </Card>

      {/* Activities for Selected Date */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedDateActivities.length} activities scheduled
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {selectedDateActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activities scheduled</p>
                <p className="text-sm mt-1">Select a date with activities</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateActivities
                  .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                  .map((activity) => {
                    const lead = getLeadForActivity(activity);
                    const Icon = activityIcons[activity.type];
                    const colorClass = activityColors[activity.type];

                    return (
                      <div
                        key={activity.id}
                        onClick={() => onActivityClick(activity)}
                        className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", colorClass)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground line-clamp-1">
                              {activity.title}
                            </h4>
                            {lead && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {lead.name} • {lead.company}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(activity.scheduledAt)}
                            </p>
                            {activity.completedAt && (
                              <Badge variant="outline" className="mt-2 text-xs bg-success/10 text-success border-success/30">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
