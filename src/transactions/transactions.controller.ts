import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateIncomeDto } from './models/create-income.dto';
import { CreateBillDto } from './models/create-bill.dto';
import { CreateSubscriptionDto } from './models/create-subscription.dto';
import { CreateSavingDto } from './models/create-saving.dto';
import { CreateExpenseDto } from './models/create-expense.dto';
import { CreateRefundDto } from './models/create-refund.dto';
import { Transaction } from './models/transaction.type';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('income')
  @ApiOperation({ summary: 'Create an income transaction' })
  @ApiResponse({
    status: 201,
    description: 'Income transaction successfully created',
    type: Transaction,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createIncome(
    @Request() req: { user: { id: string; email: string } },
    @Body() createIncomeDto: CreateIncomeDto,
  ): Promise<Transaction> {
    return this.transactionsService.createIncome(req.user.id, createIncomeDto);
  }

  @Post('bill')
  @ApiOperation({ summary: 'Create a bill transaction' })
  @ApiResponse({
    status: 201,
    description: 'Bill transaction successfully created',
    type: Transaction,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBill(
    @Request() req: { user: { id: string; email: string } },
    @Body() createBillDto: CreateBillDto,
  ): Promise<Transaction> {
    return this.transactionsService.createBill(req.user.id, createBillDto);
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Create a subscription transaction' })
  @ApiResponse({
    status: 201,
    description: 'Subscription transaction successfully created',
    type: Transaction,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Create a saving transaction' })
  @ApiResponse({
    status: 201,
    description: 'Saving transaction successfully created',
    type: Transaction,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSaving(
    @Request() req: { user: { id: string; email: string } },
    @Body() createSavingDto: CreateSavingDto,
  ): Promise<Transaction> {
    return this.transactionsService.createSaving(req.user.id, createSavingDto);
  }

  @Post('expense')
  @ApiOperation({ summary: 'Create an expense transaction' })
  @ApiResponse({
    status: 201,
    description: 'Expense transaction successfully created',
    type: Transaction,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createExpense(
    @Request() req: { user: { id: string; email: string } },
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<Transaction> {
    return this.transactionsService.createExpense(req.user.id, createExpenseDto);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Create a refund transaction' })
  @ApiResponse({
    status: 201,
    description: 'Refund transaction successfully created',
    type: Transaction,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createRefund(
    @Request() req: { user: { id: string; email: string } },
    @Body() createRefundDto: CreateRefundDto,
  ): Promise<Transaction> {
    return this.transactionsService.createRefund(req.user.id, createRefundDto);
  }

  @Post('admin/test')
  @ApiOperation({ summary: 'Test transactions module' })
  @ApiResponse({ status: 200, description: 'Transactions module is working correctly' })
  test() {
    return { message: 'Transactions module is working correctly' };
  }
}

