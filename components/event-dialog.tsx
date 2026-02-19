"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_COLORS,
  PRIORITIES,
  KASALI_MEMBERS,
  type SchedulerEvent,
  type Priority,
  type KasaliMember,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check } from "lucide-react";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  event?: SchedulerEvent | null;
  onSave: (data: {
    title: string;
    description: string;
    date: string;
    time: string;
    color: string;
    priority: Priority;
    kasali: KasaliMember[];
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EventDialog({
  open,
  onOpenChange,
  selectedDate,
  event,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState("blue");
  const [priority, setPriority] = useState<Priority>("medium");
  const [kasali, setKasali] = useState<KasaliMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setTime(event.time);
      setColor(event.color);
      setPriority(event.priority || "medium");
      setKasali(event.kasali || []);
    } else {
      setTitle("");
      setDescription("");
      setTime("09:00");
      setColor("blue");
      setPriority("medium");
      setKasali([]);
    }
  }, [event, open]);

  function toggleKasali(member: KasaliMember) {
    setKasali((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  }

  async function handleSave() {
    if (!title.trim() || !selectedDate) return;
    setSaving(true);
    try {
      await onSave({
        title,
        description,
        date: format(selectedDate, "yyyy-MM-dd"),
        time,
        color,
        priority,
        kasali,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return;
    setSaving(true);
    try {
      await onDelete(event._id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {event ? "Edit Event" : "New Event"}
          </DialogTitle>
          <DialogDescription>
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="time" className="text-foreground">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Priority</Label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                    priority === p.value
                      ? cn(p.class, "ring-2 ring-ring ring-offset-1")
                      : "bg-muted text-muted-foreground border-transparent hover:bg-accent"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Kasali (Collaborators)</Label>
            <div className="flex flex-wrap gap-2">
              {KASALI_MEMBERS.map((member) => {
                const isSelected = kasali.includes(member);
                return (
                  <button
                    key={member}
                    type="button"
                    onClick={() => toggleKasali(member)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {isSelected && <Check className="size-3" />}
                    {member}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Color</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "size-8 rounded-full transition-all",
                    c.dot,
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-ring"
                      : "opacity-60 hover:opacity-100"
                  )}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {event && onDelete ? (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim()}
            >
              {saving ? "Saving..." : event ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
