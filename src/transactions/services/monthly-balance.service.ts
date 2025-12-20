import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { MonthlyBalance } from '../models/types/monthly-balance.type';
import { buildMonthDateRange } from '../utils/transaction-query-builder.util';

/**
 * Service responsible for calculating and caching monthly balance summaries.
 */
@Injectable()
export class MonthlyBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates the monthly balance for a given user and month.
   * Uses cached values if available, otherwise calculates and caches.
   * Balance is CUMULATIVE (includes all previous months).
   * Formula: previousMonthBalance + (Income + Refunds - Bills - Savings - Subscriptions - Expenses)
   * Bills, Savings, and Subscriptions are considered "planned" for the month.
   * Expenses and Refunds are actual transactions that occurred.
   */
  async getMonthlyBalance(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyBalance> {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }
    const cachedBalance = await this.prisma.monthlyBalanceSummary.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
    });
    let totalIncome: number;
    let totalBills: number;
    let totalSavings: number;
    let totalSubscriptions: number;
    let totalExpenses: number;
    let totalRefunds: number;
    let balance: number;
    let previousMonthBalance: number | null = null;
    if (cachedBalance) {
      totalIncome = Number(cachedBalance.totalIncome);
      totalBills = Number(cachedBalance.totalBills);
      totalSavings = Number(cachedBalance.totalSavings);
      totalSubscriptions = Number(cachedBalance.totalSubscriptions);
      totalExpenses = Number(cachedBalance.totalExpenses);
      totalRefunds = Number(cachedBalance.totalRefunds);
      balance = Number(cachedBalance.balance);
      previousMonthBalance = await this.getPreviousMonthBalanceFromCache(
        userId,
        year,
        month,
      );
    } else {
      const dateRange = buildMonthDateRange(year, month);
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          date: dateRange,
        },
      });
      totalIncome = 0;
      totalBills = 0;
      totalSavings = 0;
      totalSubscriptions = 0;
      totalExpenses = 0;
      totalRefunds = 0;
      transactions.forEach((transaction) => {
        const value = Number(transaction.value);
        switch (transaction.type) {
          case TransactionType.INCOME:
            totalIncome += value;
            break;
          case TransactionType.BILL:
            totalBills += value;
            break;
          case TransactionType.SAVINGS:
            totalSavings += value;
            break;
          case TransactionType.SUBSCRIPTION:
            totalSubscriptions += value;
            break;
          case TransactionType.EXPENSE:
            totalExpenses += value;
            break;
          case TransactionType.REFUND:
            totalRefunds += value;
            break;
        }
      });
      const monthDelta =
        totalIncome +
        totalRefunds -
        totalBills -
        totalSavings -
        totalSubscriptions -
        totalExpenses;
      previousMonthBalance = await this.getPreviousMonthBalanceFromCache(
        userId,
        year,
        month,
      );
      balance = (previousMonthBalance || 0) + monthDelta;
      await this.prisma.monthlyBalanceSummary.upsert({
        where: {
          userId_year_month: {
            userId,
            year,
            month,
          },
        },
        create: {
          userId,
          year,
          month,
          totalIncome,
          totalBills,
          totalSavings,
          totalSubscriptions,
          totalExpenses,
          totalRefunds,
          balance,
        },
        update: {
          totalIncome,
          totalBills,
          totalSavings,
          totalSubscriptions,
          totalExpenses,
          totalRefunds,
          balance,
        },
      });
    }
    return {
      year,
      month,
      totalIncome,
      totalBills,
      totalSavings,
      totalSubscriptions,
      totalExpenses,
      totalRefunds,
      balance,
      previousMonthBalance,
    };
  }

  /**
   * Calculates the monthly balance for the previous month.
   */
  async getPreviousMonthBalance(userId: string): Promise<MonthlyBalance> {
    const now = new Date();
    let previousMonth = now.getMonth() + 1;
    let previousYear = now.getFullYear();

    if (previousMonth === 1) {
      previousMonth = 12;
      previousYear -= 1;
    } else {
      previousMonth -= 1;
    }

    return this.getMonthlyBalance(userId, previousYear, previousMonth);
  }

  /**
   * Invalidates and recalculates the monthly balance cache for a date's month.
   * This should be called when transactions are created, updated, or deleted.
   */
  async invalidateMonthlyBalanceForDate(
    userId: string,
    date: Date,
  ): Promise<void> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    await this.invalidateMonthlyBalance(userId, year, month);
  }

  /**
   * Invalidates and recalculates the monthly balance cache for a specific month.
   * This should be called when transactions are created, updated, or deleted.
   */
  async invalidateMonthlyBalance(
    userId: string,
    year: number,
    month: number,
  ): Promise<void> {
    const dateRange = buildMonthDateRange(year, month);
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: dateRange,
      },
    });
    let totalIncome = 0;
    let totalBills = 0;
    let totalSavings = 0;
    let totalSubscriptions = 0;
    let totalExpenses = 0;
    let totalRefunds = 0;
    transactions.forEach((transaction) => {
      const value = Number(transaction.value);
      switch (transaction.type) {
        case TransactionType.INCOME:
          totalIncome += value;
          break;
        case TransactionType.BILL:
          totalBills += value;
          break;
        case TransactionType.SAVINGS:
          totalSavings += value;
          break;
        case TransactionType.SUBSCRIPTION:
          totalSubscriptions += value;
          break;
        case TransactionType.EXPENSE:
          totalExpenses += value;
          break;
        case TransactionType.REFUND:
          totalRefunds += value;
          break;
      }
    });
    const balance =
      totalIncome +
      totalRefunds -
      totalBills -
      totalSavings -
      totalSubscriptions -
      totalExpenses;
    await this.prisma.monthlyBalanceSummary.upsert({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
      create: {
        userId,
        year,
        month,
        totalIncome,
        totalBills,
        totalSavings,
        totalSubscriptions,
        totalExpenses,
        totalRefunds,
        balance,
      },
      update: {
        totalIncome,
        totalBills,
        totalSavings,
        totalSubscriptions,
        totalExpenses,
        totalRefunds,
        balance,
      },
    });
  }

  /**
   * Gets the previous month's balance from cache, or null if not available.
   */
  private async getPreviousMonthBalanceFromCache(
    userId: string,
    year: number,
    month: number,
  ): Promise<number | null> {
    let previousMonth = month - 1;
    let previousYear = year;
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear -= 1;
    }
    const cachedBalance = await this.prisma.monthlyBalanceSummary.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: previousYear,
          month: previousMonth,
        },
      },
    });
    return cachedBalance ? Number(cachedBalance.balance) : null;
  }
}
