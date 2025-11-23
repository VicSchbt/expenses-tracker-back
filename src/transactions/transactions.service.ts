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

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createIncome(
    userId: string,
    createIncomeDto: CreateIncomeDto,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createIncomeDto.label,
        date: new Date(createIncomeDto.date),
        value: createIncomeDto.value,
        type: TransactionType.INCOME,
        recurrence: createIncomeDto.recurrence,
      },
    });
    return this.mapToTransactionType(transaction);
  }

  async createBill(
    userId: string,
    createBillDto: CreateBillDto,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createBillDto.label,
        date: new Date(createBillDto.date),
        value: createBillDto.value,
        type: TransactionType.BILL,
        recurrence: createBillDto.recurrence,
      },
    });
    return this.mapToTransactionType(transaction);
  }

  async createSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        label: createSubscriptionDto.label,
        date: new Date(createSubscriptionDto.date),
        value: createSubscriptionDto.value,
        type: TransactionType.SUBSCRIPTION,
        recurrence: createSubscriptionDto.recurrence,
      },
    });
    return this.mapToTransactionType(transaction);
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
      },
    });
    return this.mapToTransactionType(transaction);
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
    isPaid: boolean | null;
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
      isPaid: transaction.isPaid,
      dueDate: transaction.dueDate,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}

