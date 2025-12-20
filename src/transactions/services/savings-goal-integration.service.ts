import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';

/**
 * Service responsible for updating savings goals when transactions change.
 */
@Injectable()
export class SavingsGoalIntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Updates a savings goal's current amount by adding the transaction value multiplied by count.
   * Used when creating new savings transactions.
   */
  async addToSavingsGoal(
    goalId: string,
    value: number,
    count: number = 1,
  ): Promise<void> {
    await this.prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: {
          increment: value * count,
        },
      },
    });
  }

  /**
   * Updates a savings goal's current amount by subtracting the transaction value.
   * Used when deleting savings transactions.
   */
  async subtractFromSavingsGoal(goalId: string, value: number): Promise<void> {
    await this.prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: {
          increment: -value,
        },
      },
    });
  }

  /**
   * Updates a savings goal's current amount based on the difference between old and new values.
   * Used when updating savings transactions.
   */
  async updateSavingsGoalAmount(
    goalId: string,
    oldValue: number,
    newValue: number,
  ): Promise<void> {
    const difference = newValue - oldValue;
    if (difference !== 0) {
      await this.prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: {
            increment: difference,
          },
        },
      });
    }
  }

  /**
   * Updates a savings goal's current amount for multiple transactions.
   * Used when updating/deleting multiple recurring savings transactions.
   */
  async updateSavingsGoalForMultipleTransactions(
    goalId: string,
    oldValue: number,
    newValue: number,
    transactionCount: number,
  ): Promise<void> {
    const difference = newValue - oldValue;
    if (difference !== 0) {
      await this.prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: {
            increment: difference * transactionCount,
          },
        },
      });
    }
  }

  /**
   * Removes amounts from savings goals for multiple transactions.
   * Used when deleting multiple recurring savings transactions.
   */
  async removeFromSavingsGoalsForTransactions(
    transactions: Array<{ goalId: string | null; value: number }>,
  ): Promise<void> {
    for (const transaction of transactions) {
      if (transaction.goalId && Number(transaction.value) !== 0) {
        await this.subtractFromSavingsGoal(
          transaction.goalId,
          Number(transaction.value),
        );
      }
    }
  }
}
