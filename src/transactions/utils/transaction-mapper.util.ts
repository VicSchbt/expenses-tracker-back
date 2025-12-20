import { PrismaService } from 'prisma/prisma.service';
import { Recurrence } from '@prisma/client';
import { Transaction } from '../models/transaction.type';
import { calculateNextRecurrenceDate } from './recurrence-date.util';

/**
 * Checks if a date falls within a specific month and year.
 */
export function isDateInMonth(
  date: Date,
  year: number,
  month: number,
): boolean {
  return date.getFullYear() === year && date.getMonth() === month - 1;
}

/**
 * Calculates the total number of occurrences from a start date to an end date based on recurrence pattern.
 */
export function calculateTotalOccurrencesFromEndDate(
  startDate: Date,
  endDate: Date,
  recurrence: Recurrence,
): number {
  let count = 1;
  let occurrenceNumber = 1;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  while (currentDate <= end) {
    const nextDate = calculateNextRecurrenceDate(
      startDate,
      recurrence,
      occurrenceNumber + 1,
    );
    if (nextDate <= end) {
      count++;
      occurrenceNumber++;
      currentDate = nextDate;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Calculates the occurrence number for a recurring transaction instance.
 * Returns null if the transaction is not part of a recurring series with a defined count or deadline.
 *
 * @param transaction - The transaction (can be parent or child)
 * @param parentTransaction - The parent transaction with recurrence info
 * @param allSiblings - All sibling transactions (including parent) ordered by date
 * @returns Occurrence number string (e.g., "1/12") or null
 */
export function calculateOccurrenceNumber(
  transaction: any,
  parentTransaction: any | null,
  allSiblings: any[],
): string | null {
  if (!parentTransaction) {
    return null;
  }
  const hasRecurrenceCount =
    parentTransaction.recurrenceCount !== null &&
    parentTransaction.recurrenceCount !== undefined;
  const hasRecurrenceEndDate =
    parentTransaction.recurrenceEndDate !== null &&
    parentTransaction.recurrenceEndDate !== undefined;
  if (!hasRecurrenceCount && !hasRecurrenceEndDate) {
    return null;
  }
  const sortedSiblings = [...allSiblings].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const currentIndex = sortedSiblings.findIndex(
    (sibling) => sibling.id === transaction.id,
  );
  if (currentIndex === -1) {
    return null;
  }
  const occurrenceNumber = currentIndex + 1;
  let totalOccurrences: number | null = null;
  if (hasRecurrenceCount) {
    totalOccurrences = Number(parentTransaction.recurrenceCount);
    if (isNaN(totalOccurrences) || totalOccurrences <= 0) {
      return null;
    }
  } else if (
    hasRecurrenceEndDate &&
    parentTransaction.recurrence &&
    parentTransaction.recurrenceEndDate
  ) {
    const startDate = parentTransaction.date;
    const endDate = parentTransaction.recurrenceEndDate;
    const recurrence = parentTransaction.recurrence;
    totalOccurrences = calculateTotalOccurrencesFromEndDate(
      startDate,
      endDate,
      recurrence,
    );
  }
  if (totalOccurrences === null || totalOccurrences === undefined) {
    return null;
  }
  return `${occurrenceNumber}/${totalOccurrences}`;
}

/**
 * Maps a Prisma transaction to the Transaction type, including occurrence number calculation for recurring transactions.
 */
export async function mapToTransactionType(
  prisma: PrismaService,
  transaction: any,
): Promise<Transaction> {
  let occurrenceNumber: string | null = null;
  if (transaction.parentTransactionId) {
    const parentTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.parentTransactionId },
    });
    if (parentTransaction) {
      const allSiblings = await prisma.transaction.findMany({
        where: {
          OR: [
            { id: transaction.parentTransactionId },
            { parentTransactionId: transaction.parentTransactionId },
          ],
        },
        orderBy: { date: 'asc' },
      });
      occurrenceNumber = calculateOccurrenceNumber(
        transaction,
        parentTransaction,
        allSiblings,
      );
    }
  } else if (
    transaction.recurrence &&
    ((transaction.recurrenceCount !== null &&
      transaction.recurrenceCount !== undefined) ||
      (transaction.recurrenceEndDate !== null &&
        transaction.recurrenceEndDate !== undefined))
  ) {
    const allSiblings = await prisma.transaction.findMany({
      where: {
        OR: [{ id: transaction.id }, { parentTransactionId: transaction.id }],
      },
      orderBy: { date: 'asc' },
    });
    occurrenceNumber = calculateOccurrenceNumber(
      transaction,
      transaction,
      allSiblings,
    );
  }
  return {
    id: transaction.id,
    userId: transaction.userId,
    label: transaction.label,
    date: transaction.date,
    value: Number(transaction.value),
    type: transaction.type,
    categoryId: transaction.categoryId,
    goalId: transaction.goalId,
    recurrence: transaction.recurrence,
    recurrenceEndDate: transaction.recurrenceEndDate,
    recurrenceCount: transaction.recurrenceCount,
    parentTransactionId: transaction.parentTransactionId,
    occurrenceNumber,
    isPaid: transaction.isPaid,
    isAuto: transaction.isAuto ?? null,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}
