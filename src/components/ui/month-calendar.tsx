import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type?: string;
  color?: string;
}

export interface MonthCalendarProps {
  events?: CalendarEvent[];
  maxEventsPerDay?: number;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const eventTypeColors: Record<string, string> = {
  physical_meeting: "bg-primary/80 text-primary-foreground",
  virtual_meeting: "bg-purple-500/80 text-white",
  call: "bg-green-500/80 text-white",
  email: "bg-amber-500/80 text-white",
  task: "bg-sky-500/80 text-white",
  follow_up: "bg-pink-500/80 text-white",
  default: "bg-primary/80 text-primary-foreground",
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function MonthCalendar({
  className,
  events = [],
  maxEventsPerDay = 3,
  selected,
  onSelect,
  onEventClick,
}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  // Get all days to display in the calendar grid
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group events by date
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateKey = format(new Date(event.date), "yyyy-MM-dd");
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    onSelect?.(day);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentMonth(new Date());
              onSelect?.(new Date());
            }}
            className="h-8 px-3 text-xs"
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-r last:border-r-0",
              idx === 1 && "bg-primary/5 text-primary font-semibold"
            )}
          >
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-l">
        {calendarDays.map((day, idx) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(dateKey) || [];
          const displayEvents = dayEvents.slice(0, maxEventsPerDay);
          const remainingCount = dayEvents.length - maxEventsPerDay;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selected && isSameDay(day, selected);
          const isTodayDate = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[100px] border-r border-b p-1 cursor-pointer transition-colors",
                !isCurrentMonth && "bg-muted/30",
                isSelected && "bg-primary/10",
                "hover:bg-muted/50"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "inline-flex items-center justify-center h-7 w-7 text-sm rounded-full",
                    isTodayDate && "bg-primary text-primary-foreground font-bold",
                    !isTodayDate && !isCurrentMonth && "text-muted-foreground/50",
                    !isTodayDate && isCurrentMonth && "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {day.getDate() === 1 && !isSameMonth(day, currentMonth) && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(day, "MMM")}
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="mt-1 space-y-0.5">
                {displayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80",
                      eventTypeColors[event.type || "default"] || eventTypeColors.default
                    )}
                    title={event.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {format(new Date(event.date), "h:mma")} {event.title}
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="text-[10px] text-muted-foreground px-1.5">
                    +{remainingCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

MonthCalendar.displayName = "MonthCalendar";

export { MonthCalendar };
