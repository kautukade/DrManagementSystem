/* shared helpers */

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export const inr = (n: number): string => "₹" + Math.round(n).toLocaleString("en-IN");

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateShort(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ageOf(dob: string): string {
  const b = new Date(dob);
  const now = new Date();
  let y = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) y--;
  return `${Math.max(0, y)}y`;
}

export function initials(name: string): string {
  return name.replace(/^Dr\.?\s+/, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86400000);
}

export const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS = ["Monday", "Tue", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SLOT_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];

export function validPhone(p: string): boolean {
  return /^[6-9]\d{9}$/.test(p.replace(/\s/g, ""));
}

export type Tone = "ok" | "warn" | "danger" | "info" | "neutral" | "primary" | "pine";

const TONE_MAP: Record<string, Tone> = {
  "Booked": "info", "Checked In": "primary", "Waiting": "warn", "With Doctor": "pine",
  "Completed": "ok", "Cancelled": "danger", "No Show": "neutral",
  "Active": "info", "Dispensed": "ok",
  "Received": "info", "Preparing": "warn", "Ready": "primary",
  "Unpaid": "danger", "Partial": "warn", "Paid": "ok",
  "Pending": "warn", "Sample Collected": "info", "Processing": "primary",
  "Requested": "warn", "Scheduled": "info", "In Progress": "primary", "Report Ready": "ok",
  "Available": "ok", "Occupied": "danger", "Reserved": "info", "Cleaning": "warn", "Maintenance": "neutral",
  "Admitted": "primary", "Discharged": "ok",
  "Present": "ok", "Absent": "danger", "Late": "warn", "Half Day": "info", "Leave": "neutral",
  "Approved": "ok", "Rejected": "danger",
  "Due": "warn", "Administered": "ok", "Delayed": "danger", "Held": "neutral",
  "In Use": "ok", "Idle": "neutral", "Under Repair": "danger",
  "On Trip": "info",
  "Urgent": "danger", "Routine": "neutral",
};

export function toneFor(status: string): Tone {
  return TONE_MAP[status] ?? "neutral";
}

export const WA_LINK = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export const MAPS_LINK = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
