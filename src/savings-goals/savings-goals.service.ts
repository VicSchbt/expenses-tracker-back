import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSavingsGoalDto } from './models/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './models/update-savings-goal.dto';
import { SavingsGoal } from './models/savings-goal.type';
import { Transaction } from '../transactions/models/types/transaction.type';
import { GetSavingsGoalTransactionsQueryDto } from './models/get-savings-goal-transactions-query.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createSavingsGoalDto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const savingsGoal = await this.prisma.savingsGoal.create({
      data: {
        userId,
        name: createSavingsGoalDto.name,
        targetAmount: createSavingsGoalDto.targetAmount,
        dueDate: createSavingsGoalDto.dueDate
          ? new Date(createSavingsGoalDto.dueDate)
          : null,
      },
    });
    return this.mapToSavingsGoalType(savingsGoal);
  }

  async findAll(userId: string): Promise<SavingsGoal[]> {
    const savingsGoals = await this.prisma.savingsGoal.findMany({
      where: { userId },
    });
    return savingsGoals.map((goal) => this.mapToSavingsGoalType(goal));
  }

  async findOne(userId: string, id: string): Promise<SavingsGoal> {
    const savingsGoal = await this.prisma.savingsGoal.findUnique({
      where: { id },
    });
    if (!savingsGoal) {
      throw new NotFoundException('Savings goal not found');
    }
    if (savingsGoal.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this savings goal',
      );
    }
    return this.mapToSavingsGoalType(savingsGoal);
  }

  async update(
    userId: string,
    id: string,
    updateSavingsGoalDto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const existingGoal = await this.prisma.savingsGoal.findUnique({
      where: { id },
    });
    if (!existingGoal) {
      throw new NotFoundException('Savings goal not found');
    }
    if (existingGoal.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this savings goal',
      );
    }
    const savingsGoal = await this.prisma.savingsGoal.update({
      where: { id },
      data: {
        name: updateSavingsGoalDto.name,
        targetAmount: updateSavingsGoalDto.targetAmount,
        dueDate: updateSavingsGoalDto.dueDate
          ? new Date(updateSavingsGoalDto.dueDate)
          : undefined,
      },
    });
    return this.mapToSavingsGoalType(savingsGoal);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existingGoal = await this.prisma.savingsGoal.findUnique({
      where: { id },
    });
    if (!existingGoal) {
      throw new NotFoundException('Savings goal not found');
    }
    if (existingGoal.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this savings goal',
      );
    }
    await this.prisma.savingsGoal.delete({
      where: { id },
    });
  }

  async getTransactions(
    userId: string,
    goalId: string,
    queryDto?: GetSavingsGoalTransactionsQueryDto,
  ): Promise<Transaction[]> {
    const savingsGoal = await this.prisma.savingsGoal.findUnique({
      where: { id: goalId },
    });
    if (!savingsGoal) {
      throw new NotFoundException('Savings goal not found');
    }
    if (savingsGoal.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this savings goal',
      );
    }
    const now = new Date();
    let year = queryDto?.year;
    let month = queryDto?.month;
    if (year && !month) {
      throw new BadRequestException('Month is required when year is provided');
    }
    if (month && !year) {
      year = now.getFullYear();
    }
    const whereClause: any = {
      userId,
      goalId,
    };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
    });
    return transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
    );
  }

  private mapToTransactionType(transaction: any): Transaction {
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
      recurrenceCount: transaction.recurrenceCount,
      recurrenceEndDate: transaction.recurrenceEndDate,
      parentTransactionId: transaction.parentTransactionId,
      occurrenceNumber: null,
      isPaid: transaction.isPaid,
      isAuto: transaction.isAuto,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  private mapToSavingsGoalType(savingsGoal: {
    id: string;
    userId: string;
    name: string;
    targetAmount: any;
    currentAmount: any;
    dueDate: Date | null;
    createdAt: Date;
  }): SavingsGoal {
    return {
      id: savingsGoal.id,
      userId: savingsGoal.userId,
      name: savingsGoal.name,
      targetAmount: Number(savingsGoal.targetAmount),
      currentAmount: Number(savingsGoal.currentAmount),
      dueDate: savingsGoal.dueDate,
      createdAt: savingsGoal.createdAt,
    };
  }
}
