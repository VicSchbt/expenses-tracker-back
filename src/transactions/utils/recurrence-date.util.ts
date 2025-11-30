import { Recurrence } from '@prisma/client';

/**
 * Calculates the next occurrence date based on the recurrence pattern.
 * Handles edge cases like month-end dates (e.g., Jan 31 -> Feb 28/29).
 *
 * @param baseDate - The base date to calculate from
 * @param recurrence - The recurrence pattern
 * @param occurrenceNumber - Which occurrence to calculate (1 = next, 2 = after next, etc.)
 * @returns The calculated next occurrence date
 */
export function calculateNextRecurrenceDate(
  baseDate: Date,
  recurrence: Recurrence,
  occurrenceNumber: number = 1,
): Date {
  const result = new Date(baseDate);
  switch (recurrence) {
    case Recurrence.DAILY:
      result.setDate(result.getDate() + occurrenceNumber);
      break;
    case Recurrence.WEEKLY:
      result.setDate(result.getDate() + 7 * occurrenceNumber);
      break;
    case Recurrence.MONTHLY:
      const originalDay = baseDate.getDate();
      result.setMonth(result.getMonth() + occurrenceNumber);
      const lastDayOfMonth = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0,
      ).getDate();
      if (originalDay > lastDayOfMonth) {
        result.setDate(lastDayOfMonth);
      } else {
        result.setDate(originalDay);
      }
      break;
    case Recurrence.YEARLY:
      result.setFullYear(result.getFullYear() + occurrenceNumber);
      const lastDayOfYearMonth = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0,
      ).getDate();
      const originalDayYearly = baseDate.getDate();
      if (originalDayYearly > lastDayOfYearMonth) {
        result.setDate(lastDayOfYearMonth);
      } else {
        result.setDate(originalDayYearly);
      }
      break;
  }
  return result;
}

/**
 * Checks if a date is before or equal to the end date (if provided).
 *
 * @param date - The date to check
 * @param endDate - Optional end date
 * @returns True if date is before or equal to end date, or if end date is not provided
 */
export function isDateBeforeEndDate(
  date: Date,
  endDate: Date | null | undefined,
): boolean {
  if (!endDate) {
    return true;
  }
  return date <= endDate;
}

/**
 * Generates all future occurrence dates for a recurring transaction.
 * Stops when reaching the end date or after generating a maximum number of occurrences.
 *
 * @param startDate - The start date of the recurrence
 * @param recurrence - The recurrence pattern
 * @param endDate - Optional end date for the recurrence
 * @param maxOccurrences - Maximum number of occurrences to generate (default: 12 months worth)
 * @returns Array of future occurrence dates
 */
export function generateFutureOccurrenceDates(
  startDate: Date,
  recurrence: Recurrence,
  endDate: Date | null | undefined,
  maxOccurrences: number = 12,
): Date[] {
  const dates: Date[] = [];
  let occurrenceNumber = 1;
  let nextDate = calculateNextRecurrenceDate(startDate, recurrence, 1);
  while (
    occurrenceNumber <= maxOccurrences &&
    isDateBeforeEndDate(nextDate, endDate)
  ) {
    dates.push(new Date(nextDate));
    occurrenceNumber++;
    nextDate = calculateNextRecurrenceDate(startDate, recurrence, occurrenceNumber);
  }
  return dates;
}

