import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { CreateIncomeDto } from '../models/dtos/create/create-income.dto';
import { CreateBillDto } from '../models/dtos/create/create-bill.dto';
import { CreateSubscriptionDto } from '../models/dtos/create/create-subscription.dto';
import { CreateSavingDto } from '../models/dtos/create/create-saving.dto';
import { CreateExpenseDto } from '../models/dtos/create/create-expense.dto';
import { CreateRefundDto } from '../models/dtos/create/create-refund.dto';
import { Transaction } from '../models/types/transaction.type';
import { generateFutureOccurrenceDates } from '../utils/recurrence-date.util';
import { mapToTransactionType } from '../utils/transaction-mapper.util';
import { validateCategoryOwnership } from '../utils/transaction-validation.util';
import { MonthlyBalanceService } from './monthly-balance.service';
import { SavingsGoalIntegrationService } from './savings-goal-integration.service';

/**
 * Service responsible for creating transactions of all types.
 */
@Injectable()
export class TransactionCreationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monthlyBalanceService: MonthlyBalanceService,
    private readonly savingsGoalIntegrationService: SavingsGoalIntegrationService,
  ) {}

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
        recurrenceCount: createIncomeDto.recurrenceCount ?? null,
        recurrenceEndDate,
        isPaid,
        isAuto,
      } as any,
    });
    if (createIncomeDto.recurrence) {
      const maxOccurrences = createIncomeDto.recurrenceCount
        ? createIncomeDto.recurrenceCount - 1
        : 12;
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createIncomeDto.recurrence,
        recurrenceEndDate,
        maxOccurrences,
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
        const uniqueMonths = new Set<string>();
        uniqueMonths.add(
          `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`,
        );
        for (const date of futureDates) {
          uniqueMonths.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
        }
        for (const monthKey of uniqueMonths) {
          const [year, month] = monthKey.split('-').map(Number);
          await this.monthlyBalanceService.invalidateMonthlyBalance(
            userId,
            year,
            month,
          );
        }
      } else {
        await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
          userId,
          transactionDate,
        );
      }
    } else {
      await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
        userId,
        transactionDate,
      );
    }
    return await mapToTransactionType(this.prisma, parentTransaction);
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
        recurrenceCount: createBillDto.recurrenceCount ?? null,
        recurrenceEndDate,
        isPaid,
        isAuto,
      } as any,
    });
    if (createBillDto.recurrence) {
      const maxOccurrences = createBillDto.recurrenceCount
        ? createBillDto.recurrenceCount - 1
        : 12;
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createBillDto.recurrence,
        recurrenceEndDate,
        maxOccurrences,
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
    return mapToTransactionType(this.prisma, parentTransaction);
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
        recurrenceCount: createSubscriptionDto.recurrenceCount ?? null,
        recurrenceEndDate,
        isPaid,
        isAuto,
      } as any,
    });
    if (createSubscriptionDto.recurrence) {
      const maxOccurrences = createSubscriptionDto.recurrenceCount
        ? createSubscriptionDto.recurrenceCount - 1
        : 12;
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createSubscriptionDto.recurrence,
        recurrenceEndDate,
        maxOccurrences,
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
        const uniqueMonths = new Set<string>();
        uniqueMonths.add(
          `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`,
        );
        for (const date of futureDates) {
          uniqueMonths.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
        }
        for (const monthKey of uniqueMonths) {
          const [year, month] = monthKey.split('-').map(Number);
          await this.monthlyBalanceService.invalidateMonthlyBalance(
            userId,
            year,
            month,
          );
        }
      } else {
        await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
          userId,
          transactionDate,
        );
      }
    } else {
      await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
        userId,
        transactionDate,
      );
    }
    return await mapToTransactionType(this.prisma, parentTransaction);
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
    const transactionDate = new Date(createSavingDto.date);
    const recurrenceEndDate = createSavingDto.recurrenceEndDate
      ? new Date(createSavingDto.recurrenceEndDate)
      : null;
    const isAuto = createSavingDto.isAuto ?? false;
    const isPaid =
      createSavingDto.isPaid !== undefined
        ? createSavingDto.isPaid
        : isAuto
          ? true
          : false;
    const parentTransaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: `Saving to ${goal.name}`,
        date: transactionDate,
        value: createSavingDto.value,
        type: TransactionType.SAVINGS,
        goalId: createSavingDto.goalId,
        recurrence: createSavingDto.recurrence,
        recurrenceCount: createSavingDto.recurrenceCount ?? null,
        recurrenceEndDate,
        isPaid,
        isAuto,
      } as any,
    });
    if (isPaid) {
      await this.savingsGoalIntegrationService.addToSavingsGoal(
        createSavingDto.goalId,
        createSavingDto.value,
        1,
      );
    }
    if (createSavingDto.recurrence) {
      const maxOccurrences = createSavingDto.recurrenceCount
        ? createSavingDto.recurrenceCount - 1
        : 12;
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createSavingDto.recurrence,
        recurrenceEndDate,
        maxOccurrences,
      );
      if (futureDates.length > 0) {
        await this.prisma.transaction.createMany({
          data: futureDates.map((date) => ({
            userId,
            label: `Saving to ${goal.name}`,
            date,
            value: createSavingDto.value,
            type: TransactionType.SAVINGS,
            goalId: createSavingDto.goalId,
            recurrence: createSavingDto.recurrence,
            recurrenceEndDate,
            parentTransactionId: parentTransaction.id,
            isPaid,
            isAuto,
          })),
        });
        if (isPaid) {
          await this.savingsGoalIntegrationService.addToSavingsGoal(
            createSavingDto.goalId,
            createSavingDto.value,
            futureDates.length,
          );
        }
      }
    }
    await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
      userId,
      transactionDate,
    );
    return await mapToTransactionType(this.prisma, parentTransaction);
  }

  async createExpense(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Transaction> {
    if (createExpenseDto.categoryId) {
      await validateCategoryOwnership(
        this.prisma,
        userId,
        createExpenseDto.categoryId,
      );
    }
    const transactionDate = new Date(createExpenseDto.date);
    const recurrenceEndDate = createExpenseDto.recurrenceEndDate
      ? new Date(createExpenseDto.recurrenceEndDate)
      : null;
    const isAuto = createExpenseDto.isAuto ?? false;
    const isPaid =
      createExpenseDto.isPaid !== undefined
        ? createExpenseDto.isPaid
        : isAuto
          ? true
          : true;
    const parentTransaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createExpenseDto.label,
        date: transactionDate,
        value: createExpenseDto.value,
        type: TransactionType.EXPENSE,
        categoryId: createExpenseDto.categoryId,
        recurrence: createExpenseDto.recurrence,
        recurrenceCount: createExpenseDto.recurrenceCount ?? null,
        recurrenceEndDate,
        isPaid,
        isAuto,
      } as any,
    });
    if (createExpenseDto.recurrence) {
      const maxOccurrences = createExpenseDto.recurrenceCount
        ? createExpenseDto.recurrenceCount - 1
        : 12;
      const futureDates = generateFutureOccurrenceDates(
        transactionDate,
        createExpenseDto.recurrence,
        recurrenceEndDate,
        maxOccurrences,
      );
      if (futureDates.length > 0) {
        await this.prisma.transaction.createMany({
          data: futureDates.map((date) => ({
            userId,
            label: createExpenseDto.label,
            date,
            value: createExpenseDto.value,
            type: TransactionType.EXPENSE,
            categoryId: createExpenseDto.categoryId,
            recurrence: createExpenseDto.recurrence,
            recurrenceEndDate,
            parentTransactionId: parentTransaction.id,
            isPaid,
            isAuto,
          })),
        });
      }
    }
    return await mapToTransactionType(this.prisma, parentTransaction);
  }

  async createRefund(
    userId: string,
    createRefundDto: CreateRefundDto,
  ): Promise<Transaction> {
    await validateCategoryOwnership(
      this.prisma,
      userId,
      createRefundDto.categoryId,
    );
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
    await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
      userId,
      new Date(createRefundDto.date),
    );
    return mapToTransactionType(this.prisma, transaction);
  }
}
