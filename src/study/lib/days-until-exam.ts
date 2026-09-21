import { differenceInCalendarDays, startOfDay } from "date-fns";

/** Days remaining until an exam date (0 = today, negative = past). */
export function daysUntilExam(examAt: Date, from: Date = new Date()): number {
  return differenceInCalendarDays(startOfDay(examAt), startOfDay(from));
}
