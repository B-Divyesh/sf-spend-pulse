export type Currency = "USD" | "EUR" | "GBP" | "INR";
export type ReminderCadence = "none" | "daily" | "weekly";

export interface Settings {
  weeklyAllowance: number;
  currency: Currency;
  weekStarts: 0 | 1;
  reminderCadence: ReminderCadence;
  reminderTime: string;
  lastReminderAt?: string;
}

export interface SpendEntry {
  id: string;
  amount: number;
  note: string;
  occurredAt: string;
  createdAt: string;
}

export interface AppData {
  settings: Settings | null;
  entries: SpendEntry[];
}
