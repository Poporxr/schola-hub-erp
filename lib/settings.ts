import type { Weekday } from "@/generated/prisma/client";

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
};

export function formatDate(dateString: Date): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC", // optional but safer
  });
}

export function todayDateInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function greetingForHour(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function weekdayKeyFromDate(date: Date): Weekday | null {
  const weekdayKey = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()];
  if (weekdayKey === "SAT" || weekdayKey === "SUN") return null;
  return weekdayKey as Weekday;
}

export function relativeDaysLabel(date: Date | null) {
  if (!date) return "Recently";
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = start.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function formatTime(timeValue: string) {
  const [rawHour, rawMinute] = timeValue.split(":");
  const hour = Number(rawHour);
  const minute = rawMinute ?? "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const paddedHour = String(hour12).padStart(2, "0");
  return `${paddedHour}:${minute} ${suffix}`;
}

export function buildCellKey(day: Weekday, start: string, end: string) {
  const normalizedStart = normalizeTime(start);
  const normalizedEnd = normalizeTime(end);
  return `${day}|${normalizedStart}|${normalizedEnd}`;
}

export function yearsSince(date: Date | null) {
  if (!date) return "—";
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const hadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hadBirthday) years -= 1;
  return years < 0 ? "—" : `${years} Years`;
}

export function normalizeTime(timeValue: string) {
  const [rawHour, rawMinute] = timeValue.split(":");
  const hour = String(Number(rawHour)).padStart(2, "0");
  const minute = String(Number(rawMinute ?? "0")).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function buildCellKeyByStart(day: Weekday, start: string) {
  const normalizedStart = normalizeTime(start);
  return `${day}|${normalizedStart}`;
}
