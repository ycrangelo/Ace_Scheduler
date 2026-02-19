"use client";

import {
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
import { cn } from "@/lib/utils";
import { getColorClasses, getPriorityInfo, type SchedulerEvent } from "@/lib/types";

interface CalendarGridProps {
  currentDate: Date;
  events: SchedulerEvent[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: SchedulerEvent) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  currentDate,
  events,
  selectedDate,
  onSelectDate,
  onEventClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getEventsForDay(day: Date) {
    const dateStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative flex flex-col items-start border-r border-b border-border p-1.5 text-left transition-colors min-h-[80px] md:min-h-[100px]",
                !isCurrentMonth && "bg-muted/40",
                isSelected && "bg-accent",
                "hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center size-7 text-sm rounded-full",
                  today && "bg-primary text-primary-foreground font-semibold",
                  !today && isCurrentMonth && "text-foreground",
                  !today && !isCurrentMonth && "text-muted-foreground"
                )}
              >
                {format(day, "d")}
              </span>

              <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const colorClasses = getColorClasses(event.color);
                  const prio = getPriorityInfo(event.priority || "medium");
                  return (
                    <div
                      key={event._id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          onEventClick(event);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1 truncate text-[11px] md:text-xs px-1.5 py-0.5 rounded-sm font-medium cursor-pointer hover:opacity-80 transition-opacity",
                        colorClasses.bg,
                        colorClasses.text
                      )}
                    >
                      {event.priority === "high" && (
                        <span className="hidden md:inline shrink-0 size-1.5 rounded-full bg-[oklch(0.6_0.25_20)]" aria-label="High priority" />
                      )}
                      <span className="truncate">
                        <span className="hidden md:inline">{event.time}</span>{" "}
                        {event.title}
                      </span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
