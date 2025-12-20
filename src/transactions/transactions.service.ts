import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateIncomeDto } from './models/dtos/create/create-income.dto';
import { CreateBillDto } from './models/dtos/create/create-bill.dto';
import { CreateSubscriptionDto } from './models/dtos/create/create-subscription.dto';
import { CreateSavingDto } from './models/dtos/create/create-saving.dto';
import { CreateExpenseDto } from './models/dtos/create/create-expense.dto';
import { CreateRefundDto } from './models/dtos/create/create-refund.dto';
import { Transaction } from './models/types/transaction.type';
import { MonthlyBalance } from './models/types/monthly-balance.type';
import { PaginatedTransactions } from './models/types/paginated-transactions.type';
import { MonthYear } from './models/types/month-year.type';
import { GetExpensesRefundsQueryDto } from './models/dtos/query/get-expenses-refunds-query.dto';
import { GetIncomeQueryDto } from './models/dtos/query/get-income-query.dto';
import { GetBillsQueryDto } from './models/dtos/query/get-bills-query.dto';
import { GetSubscriptionsQueryDto } from './models/dtos/query/get-subscriptions-query.dto';
import { GetSavingsQueryDto } from './models/dtos/query/get-savings-query.dto';
import { UpdateTransactionDto } from './models/dtos/update/update-transaction.dto';
import { DeleteTransactionQueryDto } from './models/dtos/query/delete-transaction-query.dto';
import { MonthlyBalanceService } from './services/monthly-balance.service';
import { SavingsGoalIntegrationService } from './services/savings-goal-integration.service';
import { TransactionCreationService } from './services/transaction-creation.service';
import { TransactionQueryService } from './services/transaction-query.service';
import { TransactionUpdateService } from './services/transaction-update.service';
import { TransactionDeletionService } from './services/transaction-deletion.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monthlyBalanceService: MonthlyBalanceService,
    private readonly savingsGoalIntegrationService: SavingsGoalIntegrationService,
    private readonly transactionCreationService: TransactionCreationService,
    private readonly transactionQueryService: TransactionQueryService,
    private readonly transactionUpdateService: TransactionUpdateService,
    private readonly transactionDeletionService: TransactionDeletionService,
  ) {}

  async createIncome(
    userId: string,
    createIncomeDto: CreateIncomeDto,
  ): Promise<Transaction> {
    return this.transactionCreationService.createIncome(
      userId,
      createIncomeDto,
    );
  }

  async createBill(
    userId: string,
    createBillDto: CreateBillDto,
  ): Promise<Transaction> {
    return this.transactionCreationService.createBill(userId, createBillDto);
  }

  async createSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Transaction> {
    return this.transactionCreationService.createSubscription(
      userId,
      createSubscriptionDto,
    );
  }

  async createSaving(
    userId: string,
    createSavingDto: CreateSavingDto,
  ): Promise<Transaction> {
    return this.transactionCreationService.createSaving(
      userId,
      createSavingDto,
    );
  }

  async createExpense(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Transaction> {
    return this.transactionCreationService.createExpense(
      userId,
      createExpenseDto,
    );
  }

  async createRefund(
    userId: string,
    createRefundDto: CreateRefundDto,
  ): Promise<Transaction> {
    return this.transactionCreationService.createRefund(
      userId,
      createRefundDto,
    );
  }

  async updateTransaction(
    userId: string,
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionUpdateService.updateTransaction(
      userId,
      id,
      updateTransactionDto,
    );
  }

  async updateIsAuto(
    userId: string,
    id: string,
    isAuto: boolean,
  ): Promise<Transaction> {
    return this.transactionUpdateService.updateIsAuto(userId, id, isAuto);
  }

  async removeTransaction(
    userId: string,
    id: string,
    queryDto?: DeleteTransactionQueryDto,
  ): Promise<void> {
    return this.transactionDeletionService.removeTransaction(
      userId,
      id,
      queryDto,
    );
  }

  /**
   * Calculates the monthly balance for a given user and month.
   * Delegates to MonthlyBalanceService.
   */
  async getMonthlyBalance(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyBalance> {
    return this.monthlyBalanceService.getMonthlyBalance(userId, year, month);
  }

  /**
   * Calculates the monthly balance for the previous month.
   * Delegates to MonthlyBalanceService.
   */
  async getPreviousMonthBalance(userId: string): Promise<MonthlyBalance> {
    return this.monthlyBalanceService.getPreviousMonthBalance(userId);
  }

  /**
   * Fetches all expenses and refunds for a user with pagination and optional month filtering.
   * - If year and month are provided: filters by that specific month
   * - If only month is provided: uses current year with the specified month
   * - If neither is provided: returns all expenses and refunds (no month filter)
   */
  async getExpensesAndRefunds(
    userId: string,
    queryDto: GetExpensesRefundsQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getExpensesAndRefunds(userId, queryDto);
  }

  async getCurrentMonthExpensesAndRefunds(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getCurrentMonthExpensesAndRefunds(
      userId,
      page,
      limit,
    );
  }

  async getIncome(
    userId: string,
    queryDto: GetIncomeQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getIncome(userId, queryDto);
  }

  async getCurrentMonthIncome(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getCurrentMonthIncome(
      userId,
      page,
      limit,
    );
  }

  async getBills(
    userId: string,
    queryDto: GetBillsQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getBills(userId, queryDto);
  }

  async getCurrentMonthBills(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getCurrentMonthBills(
      userId,
      page,
      limit,
    );
  }

  async getSubscriptions(
    userId: string,
    queryDto: GetSubscriptionsQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getSubscriptions(userId, queryDto);
  }

  async getCurrentMonthSubscriptions(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getCurrentMonthSubscriptions(
      userId,
      page,
      limit,
    );
  }

  async getSavings(
    userId: string,
    queryDto: GetSavingsQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionQueryService.getSavings(userId, queryDto);
  }

  async getAvailableMonths(userId: string): Promise<MonthYear[]> {
    return this.transactionQueryService.getAvailableMonths(userId);
  }
}
