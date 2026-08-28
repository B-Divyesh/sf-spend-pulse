import type { SpendEntry } from "./types";

export function startOfWeek(date: Date, weekStarts: 0 | 1): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const offset = (result.getDay() - weekStarts + 7) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

export function entriesThisWeek(entries: SpendEntry[], now: Date, weekStarts: 0 | 1): SpendEntry[] {
  const start = startOfWeek(now, weekStarts).getTime();
  const end = start + 7 * 86_400_000;
  return entries.filter((entry) => {
    const time = new Date(`${entry.occurredAt}T12:00:00`).getTime();
    return time >= start && time < end;
  });
}

export function paceSummary(entries: SpendEntry[], allowance: number, now: Date, weekStarts: 0 | 1) {
  const weekEntries = entriesThisWeek(entries, now, weekStarts);
  const spent = weekEntries.reduce((total, entry) => total + entry.amount, 0);
  const day = ((now.getDay() - weekStarts + 7) % 7) + 1;
  const expected = allowance * (day / 7);
  const difference = expected - spent;
  const remaining = allowance - spent;
  const percentage = allowance > 0 ? Math.min(100, Math.round((spent / allowance) * 100)) : 0;
  return { spent, expected, difference, remaining, percentage, day, weekEntries };
}
