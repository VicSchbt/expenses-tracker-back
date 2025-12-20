import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { PaginatedTransactions } from '../models/types/paginated-transactions.type';
import { MonthYear } from '../models/types/month-year.type';
import { GetExpensesRefundsQueryDto } from '../models/dtos/query/get-expenses-refunds-query.dto';
import { GetIncomeQueryDto } from '../models/dtos/query/get-income-query.dto';
import { GetBillsQueryDto } from '../models/dtos/query/get-bills-query.dto';
import { GetSubscriptionsQueryDto } from '../models/dtos/query/get-subscriptions-query.dto';
import { GetSavingsQueryDto } from '../models/dtos/query/get-savings-query.dto';
import {
  normalizeYearMonth,
  buildTransactionWhereClause,
  executePaginatedTransactionQuery,
  getCurrentMonth,
} from '../utils/transaction-query-builder.util';

/**
 * Service responsible for querying and retrieving transactions.
 */
@Injectable()
export class TransactionQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches all expenses and refunds for a user with pagination and optional month filtering.
   * - If year and month are provided: filters by that specific month
   * - If only month is provided: uses current year with the specified month
   * - If neither is provided: returns all expenses and refunds (no month filter)
   */
  async getExpensesAndRefunds(
    userId: string,
    queryDto: GetExpensesRefundsQueryDto,
  ): Promise<PaginatedTransactions> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 20;
    const { year, month } = normalizeYearMonth(queryDto.year, queryDto.month);
    const whereClause = buildTransactionWhereClause(
      userId,
      [TransactionType.EXPENSE, TransactionType.REFUND],
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches expenses and refunds for the current month with pagination.
   */
  async getCurrentMonthExpensesAndRefunds(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const { year, month } = getCurrentMonth();
    const whereClause = buildTransactionWhereClause(
      userId,
      [TransactionType.EXPENSE, TransactionType.REFUND],
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches all income transactions for a user with pagination and optional month filtering.
   * - If year and month are provided: filters by that specific month
   * - If only month is provided: uses current year with the specified month
   * - If neither is provided: returns all income transactions (no month filter)
   */
  async getIncome(
    userId: string,
    queryDto: GetIncomeQueryDto,
  ): Promise<PaginatedTransactions> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 20;
    const { year, month } = normalizeYearMonth(queryDto.year, queryDto.month);
    const whereClause = buildTransactionWhereClause(
      userId,
      TransactionType.INCOME,
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches income transactions for the current month with pagination.
   */
  async getCurrentMonthIncome(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const { year, month } = getCurrentMonth();
    const whereClause = buildTransactionWhereClause(
      userId,
      TransactionType.INCOME,
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches all bill transactions for a user with pagination and optional month filtering.
   * - If year and month are provided: filters by that specific month
   * - If only month is provided: uses current year with the specified month
   * - If neither is provided: returns all bill transactions (no month filter)
   */
  async getBills(
    userId: string,
    queryDto: GetBillsQueryDto,
  ): Promise<PaginatedTransactions> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 20;
    const { year, month } = normalizeYearMonth(queryDto.year, queryDto.month);
    const whereClause = buildTransactionWhereClause(
      userId,
      TransactionType.BILL,
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches bill transactions for the current month with pagination.
   */
  async getCurrentMonthBills(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const { year, month } = getCurrentMonth();
    const whereClause = buildTransactionWhereClause(
      userId,
      TransactionType.BILL,
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches all subscription transactions for a user with pagination and optional month filtering.
   * - If year and month are provided: filters by that specific month
   * - If only month is provided: uses current year with the specified month
   * - If neither is provided: returns all subscription transactions (no month filter)
   */
  async getSubscriptions(
    userId: string,
    queryDto: GetSubscriptionsQueryDto,
  ): Promise<PaginatedTransactions> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 20;
    const { year, month } = normalizeYearMonth(queryDto.year, queryDto.month);
    const whereClause = buildTransactionWhereClause(
      userId,
      TransactionType.SUBSCRIPTION,
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches subscription transactions for the current month with pagination.
   */
  async getCurrentMonthSubscriptions(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const { year, month } = getCurrentMonth();
    const whereClause = buildTransactionWhereClause(
      userId,
      TransactionType.SUBSCRIPTION,
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Fetches all savings transactions for a user with pagination and optional month filtering.
   * - If year and month are provided: filters by that specific month
   * - If only month is provided: uses current year with the specified month
   * - If neither is provided: returns all savings transactions (no month filter)
   */
  async getSavings(
    userId: string,
    queryDto: GetSavingsQueryDto,
  ): Promise<PaginatedTransactions> {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 20;
    const { year, month } = normalizeYearMonth(queryDto.year, queryDto.month);
    const whereClause = buildTransactionWhereClause(
      userId,
      TransactionType.SAVINGS,
      year,
      month,
    );
    return executePaginatedTransactionQuery(
      this.prisma,
      whereClause,
      page,
      limit,
    );
  }

  /**
   * Gets a list of distinct months (year + month) in which the user has any transaction.
   * Returns the months sorted by date descending (newest first).
   */
  async getAvailableMonths(userId: string): Promise<MonthYear[]> {
    const results = await this.prisma.$queryRaw<
      Array<{ year: number | bigint; month: number | bigint }>
    >`
      SELECT DISTINCT
        EXTRACT(YEAR FROM date)::INTEGER as year,
        EXTRACT(MONTH FROM date)::INTEGER as month
      FROM "Transaction"
      WHERE "userId" = ${userId}
      ORDER BY year DESC, month DESC
    `;
    return results.map((row) => ({
      year: Number(row.year),
      month: Number(row.month),
    }));
  }
}
