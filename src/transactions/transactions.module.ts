import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { PrismaModule } from '../../prisma/prisma.module';
import { MonthlyBalanceService } from './services/monthly-balance.service';
import { SavingsGoalIntegrationService } from './services/savings-goal-integration.service';
import { TransactionCreationService } from './services/transaction-creation.service';
import { TransactionQueryService } from './services/transaction-query.service';
import { TransactionUpdateService } from './services/transaction-update.service';
import { TransactionDeletionService } from './services/transaction-deletion.service';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    RecurringTransactionsScheduler,
    MonthlyBalanceService,
    SavingsGoalIntegrationService,
    TransactionCreationService,
    TransactionQueryService,
    TransactionUpdateService,
    TransactionDeletionService,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
