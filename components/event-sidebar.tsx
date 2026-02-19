"use client";

import { format, isSameMonth } from "date-fns";
import { Clock, FileText, Users, CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getColorClasses, getPriorityInfo, type SchedulerEvent } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventSidebarProps {
  selectedDate: Date | null;
  currentDate: Date;
  events: SchedulerEvent[];
  allEvents: SchedulerEvent[];
  allEventsLoading: boolean;
  onEventClick: (event: SchedulerEvent) => void;
  onNewEvent: () => void;
}

function EventCard({
  event,
  onEventClick,
  showDate = false,
}: {
  event: SchedulerEvent;
  onEventClick: (event: SchedulerEvent) => void;
  showDate?: boolean;
}) {
  const colorClasses = getColorClasses(event.color);
  const priorityInfo = getPriorityInfo(event.priority || "medium");
  return (
    <button
      key={event._id}
      type="button"
      onClick={() => onEventClick(event)}
      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left w-full"
    >
      <div
        className={cn("size-2.5 rounded-full mt-1.5 shrink-0", colorClasses.dot)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-foreground truncate">
            {event.title}
          </p>
          <span
            className={cn(
              "shrink-0 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none uppercase tracking-wide",
              priorityInfo.class
            )}
          >
            {priorityInfo.label}
          </span>
        </div>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {showDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />
              <span>{format(new Date(event.date + "T00:00:00"), "MMM d, yyyy")}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{event.time}</span>
          </div>
          {event.kasali && event.kasali.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              <span className="truncate max-w-[120px]">
                {event.kasali.length <= 2
                  ? event.kasali.join(", ")
                  : `${event.kasali[0]} +${event.kasali.length - 1}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function EmptyState({ message, onNewEvent }: { message: string; onNewEvent?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <FileText className="size-8 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
      {onNewEvent && (
        <button
          type="button"
          onClick={onNewEvent}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Add an event
        </button>
      )}
    </div>
  );
}

export function EventSidebar({
  selectedDate,
  currentDate,
  events,
  allEvents,
  allEventsLoading,
  onEventClick,
  onNewEvent,
}: EventSidebarProps) {
  const dayEvents = selectedDate
    ? events
        .filter((e) => e.date === format(selectedDate, "yyyy-MM-dd"))
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const monthEvents = events
    .filter((e) => isSameMonth(new Date(e.date + "T00:00:00"), currentDate))
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });

  const sortedAllEvents = [...allEvents].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
  });

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">
            {selectedDate
              ? format(selectedDate, "EEEE, MMM d")
              : "Select a date"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} today
          </p>
        </div>
        {selectedDate && (
          <button
            type="button"
            onClick={onNewEvent}
            className="inline-flex items-center justify-center size-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg leading-none"
            aria-label="Add new event"
          >
            +
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="day" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3">
          <TabsTrigger value="day" className="text-xs">
            Day
          </TabsTrigger>
          <TabsTrigger value="month" className="text-xs">
            Month
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
        </TabsList>

        {/* Day view */}
        <TabsContent value="day" className="flex-1 overflow-y-auto p-4 mt-0">
          {dayEvents.length === 0 ? (
            <EmptyState
              message="No events scheduled"
              onNewEvent={selectedDate ? onNewEvent : undefined}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {dayEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEventClick={onEventClick}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Month view */}
        <TabsContent value="month" className="flex-1 overflow-y-auto p-4 mt-0">
          {monthEvents.length === 0 ? (
            <EmptyState message="No events this month" />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {format(currentDate, "MMMM yyyy")} &mdash; {monthEvents.length} event{monthEvents.length !== 1 ? "s" : ""}
              </p>
              {monthEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEventClick={onEventClick}
                  showDate
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* All view */}
        <TabsContent value="all" className="flex-1 overflow-y-auto p-4 mt-0">
          {allEventsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin mb-2" />
              <span className="text-sm">Loading all events...</span>
            </div>
          ) : sortedAllEvents.length === 0 ? (
            <EmptyState message="No events at all" />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                All schedules &mdash; {sortedAllEvents.length} event{sortedAllEvents.length !== 1 ? "s" : ""}
              </p>
              {sortedAllEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEventClick={onEventClick}
                  showDate
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
