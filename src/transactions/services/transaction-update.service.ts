import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { Transaction } from '../models/transaction.type';
import { UpdateTransactionDto } from '../models/update-transaction.dto';
import { RecurrenceScope } from '../models/recurrence-scope.enum';
import {
  validateCategoryOwnership,
  validateTransactionOwnership,
} from '../utils/transaction-validation.util';
import {
  collectUniqueMonths,
  parseMonthKeys,
} from '../utils/transaction-validation.util';
import { handleRecurrenceScopeUpdate } from '../utils/recurrence-scope.util';
import { mapToTransactionType } from '../utils/transaction-mapper.util';
import { MonthlyBalanceService } from './monthly-balance.service';
import { SavingsGoalIntegrationService } from './savings-goal-integration.service';

/**
 * Service responsible for updating transactions.
 */
@Injectable()
export class TransactionUpdateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monthlyBalanceService: MonthlyBalanceService,
    private readonly savingsGoalIntegrationService: SavingsGoalIntegrationService,
  ) {}

  async updateTransaction(
    userId: string,
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const existingTransaction = await validateTransactionOwnership(
      this.prisma,
      userId,
      id,
      true,
    );
    if (updateTransactionDto.categoryId) {
      await validateCategoryOwnership(
        this.prisma,
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
      await this.savingsGoalIntegrationService.updateSavingsGoalAmount(
        existingTransaction.goalId,
        existingValue,
        updateTransactionDto.value,
      );
    }
    const recurringData: any = { ...data };
    delete recurringData.date;
    if (isRecurringParent || isRecurringChild) {
      const parentId = isRecurringParent
        ? id
        : existingTransaction.parentTransactionId!;
      await handleRecurrenceScopeUpdate({
        prisma: this.prisma,
        savingsGoalIntegrationService: this.savingsGoalIntegrationService,
        parentId,
        scope,
        recurringData,
        existingTransaction,
        updateValue: updateTransactionDto.value,
        currentDate: existingTransaction.date,
      });
    }
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data,
    });
    await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
      userId,
      existingTransaction.date,
    );
    if (updateTransactionDto.date) {
      const newDate = new Date(updateTransactionDto.date);
      if (
        newDate.getFullYear() !== existingTransaction.date.getFullYear() ||
        newDate.getMonth() !== existingTransaction.date.getMonth()
      ) {
        await this.monthlyBalanceService.invalidateMonthlyBalanceForDate(
          userId,
          newDate,
        );
      }
    }
    if (isRecurringParent && scope === RecurrenceScope.ALL) {
      const uniqueMonths = collectUniqueMonths(
        existingTransaction.childTransactions.map((c) => c.date),
      );
      for (const { year, month } of parseMonthKeys(uniqueMonths)) {
        await this.monthlyBalanceService.invalidateMonthlyBalance(
          userId,
          year,
          month,
        );
      }
    }
    return await mapToTransactionType(this.prisma, updatedTransaction);
  }

  async updateIsAuto(
    userId: string,
    id: string,
    isAuto: boolean,
  ): Promise<Transaction> {
    const existingTransaction = await validateTransactionOwnership(
      this.prisma,
      userId,
      id,
      true,
    );
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
    return await mapToTransactionType(this.prisma, updatedTransaction!);
  }
}
