import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { PaginatedTransactions } from '../models/paginated-transactions.type';
import { mapToTransactionType } from './transaction-mapper.util';

/**
 * Builds a date range filter for a specific month and year.
 * Returns an object with gte (greater than or equal) and lte (less than or equal) date filters.
 */
export function buildMonthDateRange(
  year: number,
  month: number,
): { gte: Date; lte: Date } {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return {
    gte: startDate,
    lte: endDate,
  };
}

/**
 * Normalizes year and month from query parameters.
 * - If year is provided but month is not, throws BadRequestException
 * - If month is provided but year is not, uses current year
 * - Returns normalized year and month (can be null/undefined)
 */
export function normalizeYearMonth(
  year?: number,
  month?: number,
): { year?: number; month?: number } {
  if (year && !month) {
    throw new BadRequestException('Month is required when year is provided');
  }
  if (month && !year) {
    const now = new Date();
    year = now.getFullYear();
  }
  return { year, month };
}

/**
 * Builds a where clause for transaction queries with optional date filtering.
 */
export function buildTransactionWhereClause(
  userId: string,
  type: TransactionType | TransactionType[],
  year?: number,
  month?: number,
): any {
  const whereClause: any = {
    userId,
    type: Array.isArray(type) ? { in: type } : type,
  };
  if (year && month) {
    const dateRange = buildMonthDateRange(year, month);
    whereClause.date = dateRange;
  }
  return whereClause;
}

/**
 * Executes a paginated transaction query and returns the result.
 * This is a generic helper that handles the common pattern of:
 * - Building pagination (skip, take)
 * - Executing findMany and count in parallel
 * - Mapping transactions to the Transaction type
 * - Building the paginated response
 */
export async function executePaginatedTransactionQuery(
  prisma: PrismaService,
  whereClause: any,
  page: number,
  limit: number,
): Promise<PaginatedTransactions> {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        date: 'desc',
      },
    }),
    prisma.transaction.count({
      where: whereClause,
    }),
  ]);
  const totalPages = Math.ceil(total / limit);
  const mappedTransactions = await Promise.all(
    transactions.map((transaction) =>
      mapToTransactionType(prisma, transaction),
    ),
  );
  return {
    data: mappedTransactions,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Gets the current month's year and month as numbers.
 */
export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}
