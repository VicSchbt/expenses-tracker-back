import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';
import { Recurrence } from '@prisma/client';
import {
  generateFutureOccurrenceDates,
  calculateNextRecurrenceDate,
  isDateBeforeEndDate,
} from './utils/recurrence-date.util';

/**
 * Scheduled task that generates future recurring transaction instances.
 * Runs daily at midnight to ensure all recurring transactions have future instances.
 */
@Injectable()
export class RecurringTransactionsScheduler {
  private readonly logger = new Logger(RecurringTransactionsScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateFutureRecurringTransactions(): Promise<void> {
    this.logger.log('Starting scheduled task to generate future recurring transactions');
    try {
      const now = new Date();
      const maxFutureDate = new Date(now);
      maxFutureDate.setMonth(maxFutureDate.getMonth() + 12);
      const parentTransactions = await this.prisma.transaction.findMany({
        where: {
          recurrence: {
            not: null,
          },
          parentTransactionId: null,
        },
      });
      let generatedCount = 0;
      for (const parent of parentTransactions) {
        if (!parent.recurrence) {
          continue;
        }
        const endDate = parent.recurrenceEndDate;
        if (endDate && endDate < now) {
          continue;
        }
        const lastChild = await this.prisma.transaction.findFirst({
          where: {
            parentTransactionId: parent.id,
          },
          orderBy: {
            date: 'desc',
          },
        });
        const lastDate = lastChild ? lastChild.date : parent.date;
        const nextDate = calculateNextRecurrenceDate(
          lastDate,
          parent.recurrence,
          1,
        );
        if (!isDateBeforeEndDate(nextDate, endDate)) {
          continue;
        }
        if (nextDate > maxFutureDate) {
          continue;
        }
        const existingNext = await this.prisma.transaction.findFirst({
          where: {
            parentTransactionId: parent.id,
            date: nextDate,
          },
        });
        if (existingNext) {
          continue;
        }
        const futureDates = generateFutureOccurrenceDates(
          lastDate,
          parent.recurrence,
          endDate,
          12,
        ).filter((date) => date <= maxFutureDate && date > lastDate);
        if (futureDates.length > 0) {
          await this.prisma.transaction.createMany({
            data: futureDates.map((date) => ({
              userId: parent.userId,
              label: parent.label,
              date,
              value: parent.value,
              type: parent.type,
              categoryId: parent.categoryId,
              goalId: parent.goalId,
              recurrence: parent.recurrence,
              recurrenceEndDate: parent.recurrenceEndDate,
              parentTransactionId: parent.id,
              isPaid: parent.isPaid,
              isAuto: parent.isAuto,
            })),
          });
          generatedCount += futureDates.length;
          if (parent.type === 'SAVINGS' && parent.goalId) {
            await this.prisma.savingsGoal.update({
              where: { id: parent.goalId },
              data: {
                currentAmount: {
                  increment: Number(parent.value) * futureDates.length,
                },
              },
            });
          }
        }
      }
      this.logger.log(
        `Successfully generated ${generatedCount} future recurring transaction instances`,
      );
    } catch (error) {
      this.logger.error(
        'Error generating future recurring transactions',
        error.stack,
      );
    }
  }
}

