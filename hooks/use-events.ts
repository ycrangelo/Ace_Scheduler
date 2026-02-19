import useSWR from "swr";
import type { SchedulerEvent } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useEvents(month: number, year: number) {
  const { data, error, isLoading, mutate } = useSWR<SchedulerEvent[]>(
    `/api/events?month=${month}&year=${year}`,
    fetcher
  );

  const {
    data: allData,
    isLoading: allLoading,
    mutate: mutateAll,
  } = useSWR<SchedulerEvent[]>("/api/events", fetcher);

  async function createEvent(event: Omit<SchedulerEvent, "_id" | "createdAt">) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error("Failed to create event");
    const newEvent = await res.json();
    mutate();
    mutateAll();
    return newEvent;
  }

  async function updateEvent(event: Partial<SchedulerEvent> & { _id: string }) {
    const res = await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error("Failed to update event");
    mutate();
    mutateAll();
  }

  async function deleteEvent(id: string) {
    const res = await fetch(`/api/events?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete event");
    mutate();
    mutateAll();
  }

  return {
    events: data || [],
    allEvents: allData || [],
    allEventsLoading: allLoading,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
