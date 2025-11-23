import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateIncomeDto } from './models/create-income.dto';
import { CreateBillDto } from './models/create-bill.dto';
import { CreateSubscriptionDto } from './models/create-subscription.dto';
import { CreateSavingDto } from './models/create-saving.dto';
import { CreateExpenseDto } from './models/create-expense.dto';
import { CreateRefundDto } from './models/create-refund.dto';
import { Transaction } from './models/transaction.type';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('income')
  async createIncome(
    @Request() req: { user: { id: string; email: string } },
    @Body() createIncomeDto: CreateIncomeDto,
  ): Promise<Transaction> {
    return this.transactionsService.createIncome(req.user.id, createIncomeDto);
  }

  @Post('bill')
  async createBill(
    @Request() req: { user: { id: string; email: string } },
    @Body() createBillDto: CreateBillDto,
  ): Promise<Transaction> {
    return this.transactionsService.createBill(req.user.id, createBillDto);
  }

  @Post('subscription')
  async createSubscription(
    @Request() req: { user: { id: string; email: string } },
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Transaction> {
    return this.transactionsService.createSubscription(
      req.user.id,
      createSubscriptionDto,
    );
  }

  @Post('saving')
  async createSaving(
    @Request() req: { user: { id: string; email: string } },
    @Body() createSavingDto: CreateSavingDto,
  ): Promise<Transaction> {
    return this.transactionsService.createSaving(req.user.id, createSavingDto);
  }

  @Post('expense')
  async createExpense(
    @Request() req: { user: { id: string; email: string } },
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<Transaction> {
    return this.transactionsService.createExpense(req.user.id, createExpenseDto);
  }

  @Post('refund')
  async createRefund(
    @Request() req: { user: { id: string; email: string } },
    @Body() createRefundDto: CreateRefundDto,
  ): Promise<Transaction> {
    return this.transactionsService.createRefund(req.user.id, createRefundDto);
  }

  @Post('admin/test')
  test() {
    return { message: 'Transactions module is working correctly' };
  }
}

