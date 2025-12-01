import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
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
import { MonthlyBalance } from './models/monthly-balance.type';
import { PaginatedTransactions } from './models/paginated-transactions.type';
import { GetExpensesRefundsQueryDto } from './models/get-expenses-refunds-query.dto';
import { GetIncomeQueryDto } from './models/get-income-query.dto';
import { GetBillsQueryDto } from './models/get-bills-query.dto';
import { GetSubscriptionsQueryDto } from './models/get-subscriptions-query.dto';
import { UpdateTransactionDto } from './models/update-transaction.dto';
import { DeleteTransactionQueryDto } from './models/delete-transaction-query.dto';
import { UpdateIsAutoDto } from './models/update-is-auto.dto';

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
    return this.transactionsService.createExpense(
      req.user.id,
      createExpenseDto,
    );
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

  @Get('expenses-refunds')
  @ApiOperation({
    summary: 'Get expenses and refunds',
    description:
      'Fetches all expenses and refunds for the user with pagination. Can filter by month/year or get all transactions. If only month is provided, uses current year. If neither year nor month is provided, returns all transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses and refunds successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExpensesAndRefunds(
    @Request() req: { user: { id: string; email: string } },
    @Query() queryDto: GetExpensesRefundsQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionsService.getExpensesAndRefunds(
      req.user.id,
      queryDto,
    );
  }

  @Get('expenses-refunds/current-month')
  @ApiOperation({
    summary: 'Get current month expenses and refunds',
    description:
      'Fetches expenses and refunds for the current month with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current month expenses and refunds successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentMonthExpensesAndRefunds(
    @Request() req: { user: { id: string; email: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTransactions> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }
    return this.transactionsService.getCurrentMonthExpensesAndRefunds(
      req.user.id,
      pageNumber,
      limitNumber,
    );
  }

  @Get('income')
  @ApiOperation({
    summary: 'Get income transactions',
    description:
      'Fetches all income transactions for the user with pagination. Can filter by month/year or get all transactions. If only month is provided, uses current year. If neither year nor month is provided, returns all transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Income transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getIncome(
    @Request() req: { user: { id: string; email: string } },
    @Query() queryDto: GetIncomeQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionsService.getIncome(req.user.id, queryDto);
  }

  @Get('income/current-month')
  @ApiOperation({
    summary: 'Get current month income transactions',
    description:
      'Fetches income transactions for the current month with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current month income transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentMonthIncome(
    @Request() req: { user: { id: string; email: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTransactions> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }
    return this.transactionsService.getCurrentMonthIncome(
      req.user.id,
      pageNumber,
      limitNumber,
    );
  }

  @Get('bills')
  @ApiOperation({
    summary: 'Get bill transactions',
    description:
      'Fetches all bill transactions for the user with pagination. Can filter by month/year or get all transactions. If only month is provided, uses current year. If neither year nor month is provided, returns all transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bill transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBills(
    @Request() req: { user: { id: string; email: string } },
    @Query() queryDto: GetBillsQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionsService.getBills(req.user.id, queryDto);
  }

  @Get('bills/current-month')
  @ApiOperation({
    summary: 'Get current month bill transactions',
    description:
      'Fetches bill transactions for the current month with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current month bill transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentMonthBills(
    @Request() req: { user: { id: string; email: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTransactions> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }
    return this.transactionsService.getCurrentMonthBills(
      req.user.id,
      pageNumber,
      limitNumber,
    );
  }

  @Get('subscriptions')
  @ApiOperation({
    summary: 'Get subscription transactions',
    description:
      'Fetches all subscription transactions for the user with pagination. Can filter by month/year or get all transactions. If only month is provided, uses current year. If neither year nor month is provided, returns all transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscriptions(
    @Request() req: { user: { id: string; email: string } },
    @Query() queryDto: GetSubscriptionsQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionsService.getSubscriptions(req.user.id, queryDto);
  }

  @Get('subscriptions/current-month')
  @ApiOperation({
    summary: 'Get current month subscription transactions',
    description:
      'Fetches subscription transactions for the current month with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current month subscription transactions successfully retrieved',
    type: PaginatedTransactions,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentMonthSubscriptions(
    @Request() req: { user: { id: string; email: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTransactions> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }
    return this.transactionsService.getCurrentMonthSubscriptions(
      req.user.id,
      pageNumber,
      limitNumber,
    );
  }

  @Get('balance/monthly')
  @ApiOperation({
    summary: 'Get monthly balance',
    description:
      'Calculates the current balance for a given month. Formula: Income + Refunds - Bills - Savings - Subscriptions - Expenses',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly balance successfully calculated',
    type: MonthlyBalance,
  })
  @ApiResponse({ status: 400, description: 'Bad request (invalid month)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlyBalance(
    @Request() req: { user: { id: string; email: string } },
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<MonthlyBalance> {
    const yearNumber = parseInt(year, 10);
    const monthNumber = parseInt(month, 10);
    if (isNaN(yearNumber) || isNaN(monthNumber)) {
      throw new BadRequestException('Year and month must be valid numbers');
    }
    return this.transactionsService.getMonthlyBalance(
      req.user.id,
      yearNumber,
      monthNumber,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a transaction',
    description:
      'Updates an existing transaction. All fields are optional; only provided fields will be updated.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully updated',
    type: Transaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateTransaction(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.updateTransaction(
      req.user.id,
      id,
      updateTransactionDto,
    );
  }

  @Patch(':id/is-auto')
  @ApiOperation({
    summary: 'Update isAuto field of a recurring transaction',
    description:
      'Updates the isAuto field of a recurring transaction. When isAuto is true, isPaid will be automatically set to true. When isAuto is false, isPaid will be automatically set to false.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction isAuto field successfully updated',
    type: Transaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Transaction does not have recurrence' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateIsAuto(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() updateIsAutoDto: UpdateIsAutoDto,
  ): Promise<Transaction> {
    return this.transactionsService.updateIsAuto(
      req.user.id,
      id,
      updateIsAutoDto.isAuto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a transaction',
    description:
      'Deletes a transaction. For recurring transactions, you can specify the scope: CURRENT_ONLY (default), CURRENT_AND_FUTURE, or ALL.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeTransaction(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Query() queryDto: DeleteTransactionQueryDto,
  ): Promise<{ message: string }> {
    await this.transactionsService.removeTransaction(req.user.id, id, queryDto);
    return { message: 'Transaction deleted successfully' };
  }

  @Post('admin/test')
  @ApiOperation({ summary: 'Test transactions module' })
  @ApiResponse({
    status: 200,
    description: 'Transactions module is working correctly',
  })
  test() {
    return { message: 'Transactions module is working correctly' };
  }
}
