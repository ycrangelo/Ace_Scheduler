export type Priority = "low" | "medium" | "high";

export const PRIORITIES: { value: Priority; label: string; class: string }[] = [
  { value: "low", label: "Low", class: "bg-[oklch(0.85_0.05_150)] text-[oklch(0.3_0.08_150)]" },
  { value: "medium", label: "Medium", class: "bg-[oklch(0.88_0.1_80)] text-[oklch(0.35_0.1_70)]" },
  { value: "high", label: "High", class: "bg-[oklch(0.85_0.1_20)] text-[oklch(0.4_0.15_20)]" },
];

export const KASALI_MEMBERS = [
  "Sir Earl",
  "Sir JM",
  "Maam Mae",
  "Sir Mark",
  "Sir Jey",
  "Maam Shaira",
] as const;

export type KasaliMember = (typeof KASALI_MEMBERS)[number];

export interface SchedulerEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: string;
  priority: Priority;
  kasali: KasaliMember[];
  createdAt: string;
  updatedAt?: string;
}

export function getPriorityInfo(priority: Priority) {
  return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[0];
}

export const EVENT_COLORS = [
  { name: "Blue", value: "blue", bg: "bg-[oklch(0.55_0.18_240)]", text: "text-[oklch(0.99_0_0)]", dot: "bg-[oklch(0.55_0.18_240)]" },
  { name: "Teal", value: "teal", bg: "bg-[oklch(0.6_0.15_180)]", text: "text-[oklch(0.99_0_0)]", dot: "bg-[oklch(0.6_0.15_180)]" },
  { name: "Amber", value: "amber", bg: "bg-[oklch(0.75_0.15_75)]", text: "text-[oklch(0.2_0.02_75)]", dot: "bg-[oklch(0.75_0.15_75)]" },
  { name: "Rose", value: "rose", bg: "bg-[oklch(0.6_0.2_15)]", text: "text-[oklch(0.99_0_0)]", dot: "bg-[oklch(0.6_0.2_15)]" },
  { name: "Slate", value: "slate", bg: "bg-[oklch(0.45_0.02_260)]", text: "text-[oklch(0.99_0_0)]", dot: "bg-[oklch(0.45_0.02_260)]" },
] as const;

export function getColorClasses(color: string) {
  return EVENT_COLORS.find((c) => c.value === color) || EVENT_COLORS[0];
}
