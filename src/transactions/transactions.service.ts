import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { CreateIncomeDto } from './models/create-income.dto';
import { CreateBillDto } from './models/create-bill.dto';
import { CreateSubscriptionDto } from './models/create-subscription.dto';
import { CreateSavingDto } from './models/create-saving.dto';
import { CreateExpenseDto } from './models/create-expense.dto';
import { CreateRefundDto } from './models/create-refund.dto';
import { Transaction } from './models/transaction.type';
import { MonthlyBalance } from './models/monthly-balance.type';
import { PaginatedTransactions } from './models/paginated-transactions.type';
import { MonthYear } from './models/month-year.type';
import { GetExpensesRefundsQueryDto } from './models/get-expenses-refunds-query.dto';
import { GetIncomeQueryDto } from './models/get-income-query.dto';
import { GetBillsQueryDto } from './models/get-bills-query.dto';
import { GetSubscriptionsQueryDto } from './models/get-subscriptions-query.dto';
import { UpdateTransactionDto } from './models/update-transaction.dto';
import { DeleteTransactionQueryDto } from './models/delete-transaction-query.dto';
import { RecurrenceScope } from './models/recurrence-scope.enum';
import { generateFutureOccurrenceDates } from './utils/recurrence-date.util';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createIncome(
    userId: string,
    createIncomeDto: CreateIncomeDto,
  ): Promise<Transaction> {
    const transactionDate = new Date(createIncomeDto.date);
    const recurrenceEndDate = createIncomeDto.recurrenceEndDate
      ? new Date(createIncomeDto.recurrenceEndDate)
      : null;
    const isAuto = createIncomeDto.isAuto ?? false;
    const isPaid =
      createIncomeDto.isPaid !== undefined
        ? createIncomeDto.isPaid
        : isAuto
          ? true
          : false;
    const parentTransaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createIncomeDto.label,
        date: transactionDate,
        value: createIncomeDto.value,
        type: TransactionType.INCOME,
        recurrence: createIncomeDto.recurrence,
        recurrenceEndDate,
        isPaid,
        isAuto,
      },
    });
    if (createIncomeDto.recurrence) {
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createIncomeDto.recurrence,
        recurrenceEndDate,
        12,
      );
      if (futureDates.length > 0) {
        await this.prisma.transaction.createMany({
          data: futureDates.map((date) => ({
            userId,
            label: createIncomeDto.label,
            date,
            value: createIncomeDto.value,
            type: TransactionType.INCOME,
            recurrence: createIncomeDto.recurrence,
            recurrenceEndDate,
            parentTransactionId: parentTransaction.id,
            isPaid,
            isAuto,
          })),
        });
      }
    }
    return this.mapToTransactionType(parentTransaction);
  }

  async createBill(
    userId: string,
    createBillDto: CreateBillDto,
  ): Promise<Transaction> {
    const transactionDate = new Date(createBillDto.date);
    const recurrenceEndDate = createBillDto.recurrenceEndDate
      ? new Date(createBillDto.recurrenceEndDate)
      : null;
    const isAuto = createBillDto.isAuto ?? false;
    const isPaid =
      createBillDto.isPaid !== undefined
        ? createBillDto.isPaid
        : isAuto
          ? true
          : false;
    const parentTransaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createBillDto.label,
        date: transactionDate,
        value: createBillDto.value,
        type: TransactionType.BILL,
        recurrence: createBillDto.recurrence,
        recurrenceEndDate,
        isPaid,
        isAuto,
      },
    });
    if (createBillDto.recurrence) {
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createBillDto.recurrence,
        recurrenceEndDate,
        12,
      );
      if (futureDates.length > 0) {
        await this.prisma.transaction.createMany({
          data: futureDates.map((date) => ({
            userId,
            label: createBillDto.label,
            date,
            value: createBillDto.value,
            type: TransactionType.BILL,
            recurrence: createBillDto.recurrence,
            recurrenceEndDate,
            parentTransactionId: parentTransaction.id,
            isPaid,
            isAuto,
          })),
        });
      }
    }
    return this.mapToTransactionType(parentTransaction);
  }

  async createSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Transaction> {
    const transactionDate = new Date(createSubscriptionDto.date);
    const recurrenceEndDate = createSubscriptionDto.recurrenceEndDate
      ? new Date(createSubscriptionDto.recurrenceEndDate)
      : null;
    const isAuto = createSubscriptionDto.isAuto ?? false;
    const isPaid =
      createSubscriptionDto.isPaid !== undefined
        ? createSubscriptionDto.isPaid
        : isAuto
          ? true
          : false;
    const parentTransaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createSubscriptionDto.label,
        date: transactionDate,
        value: createSubscriptionDto.value,
        type: TransactionType.SUBSCRIPTION,
        recurrence: createSubscriptionDto.recurrence,
        recurrenceEndDate,
        isPaid,
        isAuto,
      },
    });
    if (createSubscriptionDto.recurrence) {
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createSubscriptionDto.recurrence,
        recurrenceEndDate,
        12,
      );
      if (futureDates.length > 0) {
        await this.prisma.transaction.createMany({
          data: futureDates.map((date) => ({
            userId,
            label: createSubscriptionDto.label,
            date,
            value: createSubscriptionDto.value,
            type: TransactionType.SUBSCRIPTION,
            recurrence: createSubscriptionDto.recurrence,
            recurrenceEndDate,
            parentTransactionId: parentTransaction.id,
            isPaid,
            isAuto,
          })),
        });
      }
    }
    return this.mapToTransactionType(parentTransaction);
  }

  async createSaving(
    userId: string,
    createSavingDto: CreateSavingDto,
  ): Promise<Transaction> {
    const goal = await this.prisma.savingsGoal.findUnique({
      where: { id: createSavingDto.goalId },
    });
    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this savings goal',
      );
    }
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: `Saving to ${goal.name}`,
        date: new Date(createSavingDto.date),
        value: createSavingDto.value,
        type: TransactionType.SAVINGS,
        goalId: createSavingDto.goalId,
        isPaid: createSavingDto.isPaid ?? true,
      },
    });
    await this.prisma.savingsGoal.update({
      where: { id: createSavingDto.goalId },
      data: {
        currentAmount: {
          increment: createSavingDto.value,
        },
      },
    });
    return this.mapToTransactionType(transaction);
  }

  async createExpense(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Transaction> {
    if (createExpenseDto.categoryId) {
      await this.validateCategoryOwnership(userId, createExpenseDto.categoryId);
    }
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createExpenseDto.label,
        date: new Date(createExpenseDto.date),
        value: createExpenseDto.value,
        type: TransactionType.EXPENSE,
        categoryId: createExpenseDto.categoryId,
        isPaid: createExpenseDto.isPaid ?? true,
      },
    });
    return this.mapToTransactionType(transaction);
  }

  async createRefund(
    userId: string,
    createRefundDto: CreateRefundDto,
  ): Promise<Transaction> {
    await this.validateCategoryOwnership(userId, createRefundDto.categoryId);
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createRefundDto.label,
        date: new Date(createRefundDto.date),
        value: createRefundDto.value,
        type: TransactionType.REFUND,
        categoryId: createRefundDto.categoryId,
        isPaid: createRefundDto.isPaid ?? true,
      },
    });
    return this.mapToTransactionType(transaction);
  }

  async updateTransaction(
    userId: string,
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        childTransactions: true,
      },
    });
    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (existingTransaction.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }
    if (updateTransactionDto.categoryId) {
      await this.validateCategoryOwnership(
        userId,
        updateTransactionDto.categoryId,
      );
    }
    const isRecurringParent =
      existingTransaction.recurrence !== null &&
      !existingTransaction.parentTransactionId;
    const isRecurringChild = existingTransaction.parentTransactionId !== null;
    const scope =
      updateTransactionDto.recurrenceScope || RecurrenceScope.CURRENT_ONLY;
    const data: any = {};
    if (updateTransactionDto.label !== undefined) {
      data.label = updateTransactionDto.label;
    }
    if (updateTransactionDto.date !== undefined) {
      data.date = new Date(updateTransactionDto.date);
    }
    if (updateTransactionDto.value !== undefined) {
      data.value = updateTransactionDto.value;
    }
    if (updateTransactionDto.categoryId !== undefined) {
      data.categoryId = updateTransactionDto.categoryId;
    }
    if (updateTransactionDto.recurrence !== undefined) {
      data.recurrence = updateTransactionDto.recurrence;
    }
    if (updateTransactionDto.isPaid !== undefined) {
      data.isPaid = updateTransactionDto.isPaid;
    }
    if (updateTransactionDto.recurrenceEndDate !== undefined) {
      data.recurrenceEndDate = updateTransactionDto.recurrenceEndDate
        ? new Date(updateTransactionDto.recurrenceEndDate)
        : null;
    }
    if (
      existingTransaction.type === TransactionType.SAVINGS &&
      updateTransactionDto.value !== undefined &&
      existingTransaction.goalId
    ) {
      const existingValue = Number(existingTransaction.value);
      const difference = updateTransactionDto.value - existingValue;
      if (difference !== 0) {
        await this.prisma.savingsGoal.update({
          where: { id: existingTransaction.goalId },
          data: {
            currentAmount: {
              increment: difference,
            },
          },
        });
      }
    }
    if (isRecurringParent || isRecurringChild) {
      const parentId = isRecurringParent
        ? id
        : existingTransaction.parentTransactionId!;
      if (scope === RecurrenceScope.ALL) {
        const affectedTransactions = await this.prisma.transaction.findMany({
          where: {
            OR: [{ id: parentId }, { parentTransactionId: parentId }],
          },
        });
        if (
          existingTransaction.type === TransactionType.SAVINGS &&
          updateTransactionDto.value !== undefined &&
          existingTransaction.goalId
        ) {
          const existingValue = Number(existingTransaction.value);
          const newValue = updateTransactionDto.value;
          const difference = newValue - existingValue;
          if (difference !== 0) {
            const affectedCount = affectedTransactions.filter(
              (t) => t.goalId === existingTransaction.goalId,
            ).length;
            await this.prisma.savingsGoal.update({
              where: { id: existingTransaction.goalId },
              data: {
                currentAmount: {
                  increment: difference * affectedCount,
                },
              },
            });
          }
        }
        await this.prisma.transaction.updateMany({
          where: {
            OR: [{ id: parentId }, { parentTransactionId: parentId }],
          },
          data,
        });
      } else if (scope === RecurrenceScope.CURRENT_AND_FUTURE) {
        const currentDate = existingTransaction.date;
        const affectedTransactions = await this.prisma.transaction.findMany({
          where: {
            OR: [
              { id: parentId },
              {
                parentTransactionId: parentId,
                date: { gte: currentDate },
              },
            ],
          },
        });
        if (
          existingTransaction.type === TransactionType.SAVINGS &&
          updateTransactionDto.value !== undefined &&
          existingTransaction.goalId
        ) {
          const existingValue = Number(existingTransaction.value);
          const newValue = updateTransactionDto.value;
          const difference = newValue - existingValue;
          if (difference !== 0) {
            const affectedCount = affectedTransactions.filter(
              (t) => t.goalId === existingTransaction.goalId,
            ).length;
            await this.prisma.savingsGoal.update({
              where: { id: existingTransaction.goalId },
              data: {
                currentAmount: {
                  increment: difference * affectedCount,
                },
              },
            });
          }
        }
        await this.prisma.transaction.updateMany({
          where: {
            OR: [
              { id: parentId },
              {
                parentTransactionId: parentId,
                date: { gte: currentDate },
              },
            ],
          },
          data,
        });
      }
    }
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data,
    });
    return this.mapToTransactionType(updatedTransaction);
  }

  async updateIsAuto(
    userId: string,
    id: string,
    isAuto: boolean,
  ): Promise<Transaction> {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        childTransactions: true,
      },
    });
    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (existingTransaction.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }
    if (!existingTransaction.recurrence) {
      throw new BadRequestException(
        'Transaction does not have recurrence. isAuto can only be set for recurring transactions.',
      );
    }
    const isPaid = isAuto ? true : false;
    const isRecurringParent =
      existingTransaction.recurrence !== null &&
      !existingTransaction.parentTransactionId;
    if (isRecurringParent) {
      await this.prisma.transaction.updateMany({
        where: {
          OR: [{ id }, { parentTransactionId: id }],
        },
        data: {
          isAuto,
          isPaid,
        },
      });
    } else {
      await this.prisma.transaction.update({
        where: { id },
        data: {
          isAuto,
          isPaid,
        },
      });
    }
    const updatedTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    return this.mapToTransactionType(updatedTransaction!);
  }

  async removeTransaction(
    userId: string,
    id: string,
    queryDto?: DeleteTransactionQueryDto,
  ): Promise<void> {
    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        childTransactions: true,
      },
    });
    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (existingTransaction.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this transaction',
      );
    }
    const isRecurringParent =
      existingTransaction.recurrence !== null &&
      !existingTransaction.parentTransactionId;
    const isRecurringChild = existingTransaction.parentTransactionId !== null;
    const scope = queryDto?.recurrenceScope || RecurrenceScope.CURRENT_ONLY;
    if (isRecurringParent || isRecurringChild) {
      const parentId = isRecurringParent
        ? id
        : existingTransaction.parentTransactionId!;
      if (scope === RecurrenceScope.ALL) {
        const allTransactions = await this.prisma.transaction.findMany({
          where: {
            OR: [{ id: parentId }, { parentTransactionId: parentId }],
          },
        });
        for (const transaction of allTransactions) {
          if (
            transaction.type === TransactionType.SAVINGS &&
            transaction.goalId
          ) {
            const value = Number(transaction.value);
            await this.prisma.savingsGoal.update({
              where: { id: transaction.goalId },
              data: {
                currentAmount: {
                  increment: -value,
                },
              },
            });
          }
        }
        await this.prisma.transaction.deleteMany({
          where: {
            OR: [{ id: parentId }, { parentTransactionId: parentId }],
          },
        });
        return;
      } else if (scope === RecurrenceScope.CURRENT_AND_FUTURE) {
        const currentDate = existingTransaction.date;
        const futureTransactions = await this.prisma.transaction.findMany({
          where: {
            OR: [
              { id: parentId },
              {
                parentTransactionId: parentId,
                date: { gte: currentDate },
              },
            ],
          },
        });
        for (const transaction of futureTransactions) {
          if (
            transaction.type === TransactionType.SAVINGS &&
            transaction.goalId
          ) {
            const value = Number(transaction.value);
            await this.prisma.savingsGoal.update({
              where: { id: transaction.goalId },
              data: {
                currentAmount: {
                  increment: -value,
                },
              },
            });
          }
        }
        await this.prisma.transaction.deleteMany({
          where: {
            OR: [
              { id: parentId },
              {
                parentTransactionId: parentId,
                date: { gte: currentDate },
              },
            ],
          },
        });
        return;
      }
    }
    if (
      existingTransaction.type === TransactionType.SAVINGS &&
      existingTransaction.goalId
    ) {
      const existingValue = Number(existingTransaction.value);
      await this.prisma.savingsGoal.update({
        where: { id: existingTransaction.goalId },
        data: {
          currentAmount: {
            increment: -existingValue,
          },
        },
      });
    }
    await this.prisma.transaction.delete({
      where: { id },
    });
  }

  private async validateCategoryOwnership(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.prisma.category.findUnique({
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
   * Calculates the monthly balance for a given user and month.
   * Formula: Income + Refunds - Bills - Savings - Subscriptions - Expenses
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
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
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
    };
  }

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
    const skip = (page - 1) * limit;
    const now = new Date();
    let year = queryDto.year;
    let month = queryDto.month;
    if (year && !month) {
      throw new BadRequestException('Month is required when year is provided');
    }
    if (month && !year) {
      year = now.getFullYear();
    }
    const whereClause: any = {
      userId,
      type: {
        in: [TransactionType.EXPENSE, TransactionType.REFUND],
      },
    };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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
   * Fetches expenses and refunds for the current month with pagination.
   */
  async getCurrentMonthExpensesAndRefunds(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const skip = (page - 1) * limit;
    const whereClause = {
      userId,
      type: {
        in: [TransactionType.EXPENSE, TransactionType.REFUND],
      },
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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
    const skip = (page - 1) * limit;
    const now = new Date();
    let year = queryDto.year;
    let month = queryDto.month;
    if (year && !month) {
      throw new BadRequestException('Month is required when year is provided');
    }
    if (month && !year) {
      year = now.getFullYear();
    }
    const whereClause: any = {
      userId,
      type: TransactionType.INCOME,
    };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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
   * Fetches income transactions for the current month with pagination.
   */
  async getCurrentMonthIncome(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const skip = (page - 1) * limit;
    const whereClause = {
      userId,
      type: TransactionType.INCOME,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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
    const skip = (page - 1) * limit;
    const now = new Date();
    let year = queryDto.year;
    let month = queryDto.month;
    if (year && !month) {
      throw new BadRequestException('Month is required when year is provided');
    }
    if (month && !year) {
      year = now.getFullYear();
    }
    const whereClause: any = {
      userId,
      type: TransactionType.BILL,
    };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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
   * Fetches bill transactions for the current month with pagination.
   */
  async getCurrentMonthBills(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const skip = (page - 1) * limit;
    const whereClause = {
      userId,
      type: TransactionType.BILL,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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
    const skip = (page - 1) * limit;
    const now = new Date();
    let year = queryDto.year;
    let month = queryDto.month;
    if (year && !month) {
      throw new BadRequestException('Month is required when year is provided');
    }
    if (month && !year) {
      year = now.getFullYear();
    }
    const whereClause: any = {
      userId,
      type: TransactionType.SUBSCRIPTION,
    };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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
   * Fetches subscription transactions for the current month with pagination.
   */
  async getCurrentMonthSubscriptions(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const skip = (page - 1) * limit;
    const whereClause = {
      userId,
      type: TransactionType.SUBSCRIPTION,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const mappedTransactions = transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
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

  private isDateInMonth(date: Date, year: number, month: number): boolean {
    return date.getFullYear() === year && date.getMonth() === month - 1;
  }

  private mapToTransactionType(transaction: {
    id: string;
    userId: string;
    label: string;
    date: Date;
    value: any;
    type: TransactionType;
    categoryId: string | null;
    goalId: string | null;
    recurrence: any;
    recurrenceEndDate: Date | null;
    parentTransactionId: string | null;
    isPaid: boolean | null;
    isAuto?: boolean | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
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
      parentTransactionId: transaction.parentTransactionId,
      isPaid: transaction.isPaid,
      isAuto: transaction.isAuto ?? null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
