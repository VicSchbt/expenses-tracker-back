import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, RecurringTransactionsScheduler],
  exports: [TransactionsService],
})
export class TransactionsModule {}

