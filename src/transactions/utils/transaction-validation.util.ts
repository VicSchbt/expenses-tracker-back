import { PrismaService } from 'prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

/**
 * Validates that a category exists and belongs to the user.
 * Throws NotFoundException if category doesn't exist.
 * Throws ForbiddenException if category doesn't belong to user.
 */
export async function validateCategoryOwnership(
  prisma: PrismaService,
  userId: string,
  categoryId: string,
): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new NotFoundException('Category not found');
  }
  if (category.userId !== userId) {
    throw new ForbiddenException('You do not have access to this category');
  }
}

/**
 * Validates that a transaction exists and belongs to the user.
 * Returns the transaction if valid.
 * Throws NotFoundException if transaction doesn't exist.
 * Throws ForbiddenException if transaction doesn't belong to user.
 */
export async function validateTransactionOwnership(
  prisma: PrismaService,
  userId: string,
  transactionId: string,
  includeChildren: boolean = false,
): Promise<any> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: includeChildren
      ? {
          childTransactions: true,
        }
      : undefined,
  });
  if (!transaction) {
    throw new NotFoundException('Transaction not found');
  }
  if (transaction.userId !== userId) {
    throw new ForbiddenException('You do not have access to this transaction');
  }
  return transaction;
}

/**
 * Collects unique month keys (year-month) from an array of dates.
 * Returns a Set of strings in format "year-month".
 */
export function collectUniqueMonths(dates: Date[]): Set<string> {
  const uniqueMonths = new Set<string>();
  for (const date of dates) {
    uniqueMonths.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
  }
  return uniqueMonths;
}

/**
 * Converts month keys (from collectUniqueMonths) to year/month objects.
 * Returns an array of { year, month } objects.
 */
export function parseMonthKeys(
  monthKeys: Set<string>,
): Array<{ year: number; month: number }> {
  const result: Array<{ year: number; month: number }> = [];
  for (const monthKey of monthKeys) {
    const [year, month] = monthKey.split('-').map(Number);
    result.push({ year, month });
  }
  return result;
}
