import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type?: string;
  color?: string;
}

export interface EventCalendarProps {
  events?: CalendarEvent[];
  maxEventsPerDay?: number;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  mode?: "single";
}

const eventTypeColors: Record<string, string> = {
  physical_meeting: "bg-primary",
  virtual_meeting: "bg-purple-500",
  call: "bg-green-500",
  email: "bg-amber-500",
  task: "bg-sky-500",
  follow_up: "bg-pink-500",
  default: "bg-primary",
};

function EventCalendar({
  className,
  events = [],
  maxEventsPerDay = 3,
  selected,
  onSelect,
}: EventCalendarProps) {
  // Group events by date
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateKey = new Date(event.date).toDateString();
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  // Get dates with events for modifiers
  const datesWithEvents = React.useMemo(() => {
    return Array.from(eventsByDate.keys()).map((dateStr) => new Date(dateStr));
  }, [eventsByDate]);

  return (
    <div className={cn("relative", className)}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        showOutsideDays
        className={cn("p-3 pointer-events-auto")}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "h-12 w-10 text-center text-sm p-0 relative",
            "[&:has([aria-selected].day-range-end)]:rounded-r-md",
            "[&:has([aria-selected].day-outside)]:bg-accent/50",
            "[&:has([aria-selected])]:bg-accent",
            "first:[&:has([aria-selected])]:rounded-l-md",
            "last:[&:has([aria-selected])]:rounded-r-md",
            "focus-within:relative focus-within:z-20"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-12 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/50 relative"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground font-semibold",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
        modifiers={{
          hasEvent: datesWithEvents,
        }}
        modifiersStyles={{
          hasEvent: {
            backgroundColor: "hsl(var(--primary) / 0.15)",
            fontWeight: "600",
            borderRadius: "8px",
            boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.35)",
          },
        }}
        components={{
          IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
          DayContent: ({ date }) => {
            const dateKey = date.toDateString();
            const dayEvents = eventsByDate.get(dateKey) || [];
            const displayEvents = dayEvents.slice(0, maxEventsPerDay);

            return (
              <div className="relative flex flex-col items-center justify-center w-full h-full">
                <span>{date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {displayEvents.map((event, idx) => (
                      <div
                        key={event.id || idx}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          eventTypeColors[event.type || 'default'] || eventTypeColors.default
                        )}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > maxEventsPerDay && (
                      <span className="text-[8px] text-muted-foreground ml-0.5">
                        +{dayEvents.length - maxEventsPerDay}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          },
        }}
      />
    </div>
  );
}

EventCalendar.displayName = "EventCalendar";

export { EventCalendar };
