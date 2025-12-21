import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { DeleteTransactionQueryDto } from '../models/dtos/query/delete-transaction-query.dto';
import { RecurrenceScope } from '../models/enums/recurrence-scope.enum';
import { validateTransactionOwnership } from '../utils/transaction-validation.util';
import {
  collectUniqueMonths,
  parseMonthKeys,
} from '../utils/transaction-validation.util';
import { handleRecurrenceScopeDelete } from '../utils/recurrence-scope.util';
import { MonthlyBalanceService } from './monthly-balance.service';
import { SavingsGoalIntegrationService } from './savings-goal-integration.service';

/**
 * Service responsible for deleting transactions.
 */
@Injectable()
export class TransactionDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monthlyBalanceService: MonthlyBalanceService,
    private readonly savingsGoalIntegrationService: SavingsGoalIntegrationService,
  ) {}

  async removeTransaction(
    userId: string,
    id: string,
    queryDto?: DeleteTransactionQueryDto,
  ): Promise<void> {
    const existingTransaction = await validateTransactionOwnership(
      this.prisma,
      userId,
      id,
      true,
    );
    const isRecurringParent =
      existingTransaction.recurrence !== null &&
      !existingTransaction.parentTransactionId;
    const isRecurringChild = existingTransaction.parentTransactionId !== null;
    const scope = queryDto?.recurrenceScope || RecurrenceScope.CURRENT_ONLY;
    if (isRecurringParent || isRecurringChild) {
      const parentId = isRecurringParent
        ? id
        : existingTransaction.parentTransactionId!;
      const deleteResult = await handleRecurrenceScopeDelete({
        prisma: this.prisma,
        savingsGoalIntegrationService: this.savingsGoalIntegrationService,
        parentId,
        scope,
        existingTransaction,
        currentDate: existingTransaction.date,
      });
      const uniqueMonths = collectUniqueMonths(deleteResult.affectedMonths);
      for (const { year, month } of parseMonthKeys(uniqueMonths)) {
        await this.monthlyBalanceService.invalidateMonthlyBalance(
          userId,
          year,
          month,
        );
      }
      return;
    }
    if (
      existingTransaction.type === TransactionType.SAVINGS &&
      existingTransaction.goalId &&
      (existingTransaction.isPaid ?? false)
    ) {
      const existingValue = Number(existingTransaction.value);
      await this.savingsGoalIntegrationService.subtractFromSavingsGoal(
        existingTransaction.goalId,
        existingValue,
      );
    }
    await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
      userId,
      existingTransaction.date,
    );
    await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
