import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSavingsGoalDto } from './models/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './models/update-savings-goal.dto';
import { SavingsGoal } from './models/savings-goal.type';

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

