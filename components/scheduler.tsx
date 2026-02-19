"use client";

import { useState, useCallback } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/calendar-grid";
import { EventSidebar } from "@/components/event-sidebar";
import { EventDialog } from "@/components/event-dialog";
import { useEvents } from "@/hooks/use-events";
import type { SchedulerEvent, Priority, KasaliMember } from "@/lib/types";
import { useAutoNotify } from "@/hooks/use-auto-notify";

export function Scheduler() {
  useAutoNotify();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchedulerEvent | null>(null);

  const {
    events,
    allEvents,
    allEventsLoading,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents(currentDate.getMonth(), currentDate.getFullYear());

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((d) => subMonths(d, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((d) => addMonths(d, 1));
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
  }

  function handleNewEvent() {
    setEditingEvent(null);
    setDialogOpen(true);
  }

  function handleEventClick(event: SchedulerEvent) {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date + "T00:00:00"));
    setDialogOpen(true);
  }

  async function handleSave(data: {
    title: string;
    description: string;
    date: string;
    time: string;
    color: string;
    priority: Priority;
    kasali: KasaliMember[];
  }) {
    if (editingEvent) {
      await updateEvent({ _id: editingEvent._id, ...data });
    } else {
      await createEvent(data);
    }
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
  }

  return (
    <div className="flex flex-col min-h-screen h-dvh bg-background safe-area-inset">
      {/* Header - sticky on mobile for easy access */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Ace Scheduler
            </h1>
          </div>
          <span className="hidden sm:inline text-sm text-muted-foreground">
            |
          </span>
          <h2 className="hidden sm:block text-sm font-medium text-muted-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleToday} className="min-h-[44px] touch-manipulation px-3">
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 min-w-[44px] min-h-[44px] touch-manipulation"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 min-w-[44px] min-h-[44px] touch-manipulation"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* Mobile month label */}
      <div className="sm:hidden shrink-0 px-4 py-2 border-b border-border bg-card">
        <h2 className="text-sm font-medium text-foreground">
          {format(currentDate, "MMMM yyyy")}
        </h2>
      </div>

      {/* Main content - scrollable on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-behavior-y-contain -webkit-overflow-scrolling-touch">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="size-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Loading events...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 flex flex-col lg:min-w-0">
              <CalendarGrid
                currentDate={currentDate}
                events={events}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onEventClick={handleEventClick}
              />
            </div>
            <EventSidebar
              selectedDate={selectedDate}
              currentDate={currentDate}
              events={events}
              allEvents={allEvents}
              allEventsLoading={allEventsLoading}
              onEventClick={handleEventClick}
              onNewEvent={handleNewEvent}
            />
          </>
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        event={editingEvent}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
