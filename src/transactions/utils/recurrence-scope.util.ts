import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { RecurrenceScope } from '../models/enums/recurrence-scope.enum';
import { SavingsGoalIntegrationService } from '../services/savings-goal-integration.service';

/**
 * Parameters for handling recurrence scope updates.
 */
export interface RecurrenceScopeUpdateParams {
  prisma: PrismaService;
  savingsGoalIntegrationService: SavingsGoalIntegrationService;
  parentId: string;
  scope: RecurrenceScope;
  recurringData: any;
  existingTransaction: any;
  updateValue?: number;
  currentDate?: Date;
}

/**
 * Handles updating transactions based on recurrence scope.
 * Updates all affected transactions and handles savings goal updates if needed.
 */
export async function handleRecurrenceScopeUpdate(
  params: RecurrenceScopeUpdateParams,
): Promise<void> {
  const {
    prisma,
    savingsGoalIntegrationService,
    parentId,
    scope,
    recurringData,
    existingTransaction,
    updateValue,
    currentDate,
  } = params;

  if (scope === RecurrenceScope.ALL) {
    const affectedTransactions = await prisma.transaction.findMany({
      where: {
        OR: [{ id: parentId }, { parentTransactionId: parentId }],
      },
    });

    if (
      existingTransaction.type === TransactionType.SAVINGS &&
      updateValue !== undefined &&
      existingTransaction.goalId
    ) {
      const existingValue = Number(existingTransaction.value);
      const affectedCount = affectedTransactions.filter(
        (t) => t.goalId === existingTransaction.goalId,
      ).length;
      await savingsGoalIntegrationService.updateSavingsGoalForMultipleTransactions(
        existingTransaction.goalId!,
        existingValue,
        updateValue,
        affectedCount,
      );
    }

    await prisma.transaction.updateMany({
      where: {
        OR: [{ id: parentId }, { parentTransactionId: parentId }],
      },
      data: recurringData,
    });
  } else if (scope === RecurrenceScope.CURRENT_AND_FUTURE && currentDate) {
    const affectedTransactions = await prisma.transaction.findMany({
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
      updateValue !== undefined &&
      existingTransaction.goalId
    ) {
      const existingValue = Number(existingTransaction.value);
      const affectedCount = affectedTransactions.filter(
        (t) => t.goalId === existingTransaction.goalId,
      ).length;
      await savingsGoalIntegrationService.updateSavingsGoalForMultipleTransactions(
        existingTransaction.goalId!,
        existingValue,
        updateValue,
        affectedCount,
      );
    }

    await prisma.transaction.updateMany({
      where: {
        OR: [
          { id: parentId },
          {
            parentTransactionId: parentId,
            date: { gte: currentDate },
          },
        ],
      },
      data: recurringData,
    });
  }
}

/**
 * Parameters for handling recurrence scope deletions.
 */
export interface RecurrenceScopeDeleteParams {
  prisma: PrismaService;
  savingsGoalIntegrationService: SavingsGoalIntegrationService;
  parentId: string;
  scope: RecurrenceScope;
  existingTransaction: any;
  currentDate?: Date;
}

/**
 * Result of recurrence scope deletion operation.
 */
export interface RecurrenceScopeDeleteResult {
  deletedTransactions: any[];
  affectedMonths: Date[];
}

/**
 * Handles deleting transactions based on recurrence scope.
 * Returns information about deleted transactions and affected months.
 */
export async function handleRecurrenceScopeDelete(
  params: RecurrenceScopeDeleteParams,
): Promise<RecurrenceScopeDeleteResult> {
  const {
    prisma,
    savingsGoalIntegrationService,
    parentId,
    scope,
    existingTransaction,
    currentDate,
  } = params;

  let transactionsToDelete: any[] = [];

  if (scope === RecurrenceScope.ALL) {
    transactionsToDelete = await prisma.transaction.findMany({
      where: {
        OR: [{ id: parentId }, { parentTransactionId: parentId }],
      },
    });
  } else if (scope === RecurrenceScope.CURRENT_AND_FUTURE && currentDate) {
    transactionsToDelete = await prisma.transaction.findMany({
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
  } else {
    return {
      deletedTransactions: [],
      affectedMonths: [],
    };
  }

  const savingsTransactions = transactionsToDelete.filter(
    (t) => t.type === TransactionType.SAVINGS && t.goalId,
  );
  await savingsGoalIntegrationService.removeFromSavingsGoalsForTransactions(
    savingsTransactions.map((t) => ({
      goalId: t.goalId,
      value: Number(t.value),
    })),
  );

  await prisma.transaction.deleteMany({
    where: {
      id: {
        in: transactionsToDelete.map((t) => t.id),
      },
    },
  });

  return {
    deletedTransactions: transactionsToDelete,
    affectedMonths: transactionsToDelete.map((t) => t.date),
  };
}
