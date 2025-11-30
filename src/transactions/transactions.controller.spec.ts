import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionType, Recurrence } from '@prisma/client';
import { CreateIncomeDto } from './models/create-income.dto';
import { CreateBillDto } from './models/create-bill.dto';
import { CreateSubscriptionDto } from './models/create-subscription.dto';
import { CreateSavingDto } from './models/create-saving.dto';
import { CreateExpenseDto } from './models/create-expense.dto';
import { CreateRefundDto } from './models/create-refund.dto';
import { Transaction } from './models/transaction.type';
import { UpdateTransactionDto } from './models/update-transaction.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: jest.Mocked<TransactionsService>;

  const mockUserId = 'user-id';
  const mockTransactionId = 'transaction-id';
  const mockDate = '2024-01-15T10:00:00.000Z';

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockTransaction: Transaction = {
    id: mockTransactionId,
    userId: mockUserId,
    label: 'Test Transaction',
    date: new Date(mockDate),
    value: 100,
    type: TransactionType.EXPENSE,
    categoryId: null,
    goalId: null,
    recurrence: null,
    recurrenceEndDate: null,
    parentTransactionId: null,
    isPaid: null,
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockTransactionsService = {
      createIncome: jest.fn(),
      createBill: jest.fn(),
      createSubscription: jest.fn(),
      createSaving: jest.fn(),
      createExpense: jest.fn(),
      createRefund: jest.fn(),
      updateTransaction: jest.fn(),
      removeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIncome', () => {
    it('should create an income transaction', async () => {
      const inputCreateIncomeDto: CreateIncomeDto = {
        label: 'Salary',
        date: mockDate,
        value: 5000,
        recurrence: Recurrence.MONTHLY,
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputCreateIncomeDto.label,
        value: inputCreateIncomeDto.value,
        type: TransactionType.INCOME,
        recurrence: inputCreateIncomeDto.recurrence,
      };

      transactionsService.createIncome.mockResolvedValue(expectedTransaction);

      const actualResult = await controller.createIncome(
        mockRequest as any,
        inputCreateIncomeDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createIncome).toHaveBeenCalledWith(
        mockUserId,
        inputCreateIncomeDto,
      );
    });

    it('should create an income transaction without recurrence', async () => {
      const inputCreateIncomeDto: CreateIncomeDto = {
        label: 'Bonus',
        date: mockDate,
        value: 1000,
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputCreateIncomeDto.label,
        value: inputCreateIncomeDto.value,
        type: TransactionType.INCOME,
        recurrence: null,
      };

      transactionsService.createIncome.mockResolvedValue(expectedTransaction);

      const actualResult = await controller.createIncome(
        mockRequest as any,
        inputCreateIncomeDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createIncome).toHaveBeenCalledWith(
        mockUserId,
        inputCreateIncomeDto,
      );
    });
  });

  describe('createBill', () => {
    it('should create a bill transaction', async () => {
      const inputCreateBillDto: CreateBillDto = {
        label: 'Electricity Bill',
        date: mockDate,
        value: 150,
        recurrence: Recurrence.MONTHLY,
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputCreateBillDto.label,
        value: inputCreateBillDto.value,
        type: TransactionType.BILL,
        recurrence: inputCreateBillDto.recurrence,
      };

      transactionsService.createBill.mockResolvedValue(expectedTransaction);

      const actualResult = await controller.createBill(
        mockRequest as any,
        inputCreateBillDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createBill).toHaveBeenCalledWith(
        mockUserId,
        inputCreateBillDto,
      );
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription transaction', async () => {
      const inputCreateSubscriptionDto: CreateSubscriptionDto = {
        label: 'Netflix',
        date: mockDate,
        value: 15,
        recurrence: Recurrence.MONTHLY,
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputCreateSubscriptionDto.label,
        value: inputCreateSubscriptionDto.value,
        type: TransactionType.SUBSCRIPTION,
        recurrence: inputCreateSubscriptionDto.recurrence,
      };

      transactionsService.createSubscription.mockResolvedValue(
        expectedTransaction,
      );

      const actualResult = await controller.createSubscription(
        mockRequest as any,
        inputCreateSubscriptionDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createSubscription).toHaveBeenCalledWith(
        mockUserId,
        inputCreateSubscriptionDto,
      );
    });
  });

  describe('createSaving', () => {
    it('should create a saving transaction', async () => {
      const inputCreateSavingDto: CreateSavingDto = {
        goalId: 'goal-id',
        value: 500,
        date: mockDate,
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: 'Saving to Vacation',
        value: inputCreateSavingDto.value,
        type: TransactionType.SAVINGS,
        goalId: inputCreateSavingDto.goalId,
      };

      transactionsService.createSaving.mockResolvedValue(expectedTransaction);

      const actualResult = await controller.createSaving(
        mockRequest as any,
        inputCreateSavingDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createSaving).toHaveBeenCalledWith(
        mockUserId,
        inputCreateSavingDto,
      );
    });
  });

  describe('createExpense', () => {
    it('should create an expense transaction with category', async () => {
      const inputCreateExpenseDto: CreateExpenseDto = {
        label: 'Groceries',
        date: mockDate,
        value: 75,
        categoryId: 'category-id',
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputCreateExpenseDto.label,
        value: inputCreateExpenseDto.value,
        type: TransactionType.EXPENSE,
        categoryId: inputCreateExpenseDto.categoryId,
      };

      transactionsService.createExpense.mockResolvedValue(expectedTransaction);

      const actualResult = await controller.createExpense(
        mockRequest as any,
        inputCreateExpenseDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createExpense).toHaveBeenCalledWith(
        mockUserId,
        inputCreateExpenseDto,
      );
    });

    it('should create an expense transaction without category', async () => {
      const inputCreateExpenseDto: CreateExpenseDto = {
        label: 'Miscellaneous',
        date: mockDate,
        value: 25,
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputCreateExpenseDto.label,
        value: inputCreateExpenseDto.value,
        type: TransactionType.EXPENSE,
        categoryId: null,
      };

      transactionsService.createExpense.mockResolvedValue(expectedTransaction);

      const actualResult = await controller.createExpense(
        mockRequest as any,
        inputCreateExpenseDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createExpense).toHaveBeenCalledWith(
        mockUserId,
        inputCreateExpenseDto,
      );
    });
  });

  describe('createRefund', () => {
    it('should create a refund transaction', async () => {
      const inputCreateRefundDto: CreateRefundDto = {
        label: 'Clothing Refund',
        date: mockDate,
        value: 50,
        categoryId: 'category-id',
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputCreateRefundDto.label,
        value: inputCreateRefundDto.value,
        type: TransactionType.REFUND,
        categoryId: inputCreateRefundDto.categoryId,
      };

      transactionsService.createRefund.mockResolvedValue(expectedTransaction);

      const actualResult = await controller.createRefund(
        mockRequest as any,
        inputCreateRefundDto,
      );

      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.createRefund).toHaveBeenCalledWith(
        mockUserId,
        inputCreateRefundDto,
      );
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction', async () => {
      const inputUpdateTransactionDto: UpdateTransactionDto = {
        label: 'Updated label',
        value: 200,
      };
      const expectedTransaction: Transaction = {
        ...mockTransaction,
        label: inputUpdateTransactionDto.label as string,
        value: inputUpdateTransactionDto.value as number,
      };
      transactionsService.updateTransaction.mockResolvedValue(
        expectedTransaction,
      );
      const actualResult = await controller.updateTransaction(
        mockRequest as any,
        mockTransactionId,
        inputUpdateTransactionDto,
      );
      expect(actualResult).toEqual(expectedTransaction);
      expect(transactionsService.updateTransaction).toHaveBeenCalledWith(
        mockUserId,
        mockTransactionId,
        inputUpdateTransactionDto,
      );
    });
  });

  describe('removeTransaction', () => {
    it('should delete a transaction', async () => {
      transactionsService.removeTransaction.mockResolvedValue(undefined);
      const actualResult = await controller.removeTransaction(
        mockRequest as any,
        mockTransactionId,
      );
      expect(actualResult).toEqual({
        message: 'Transaction deleted successfully',
      });
      expect(transactionsService.removeTransaction).toHaveBeenCalledWith(
        mockUserId,
        mockTransactionId,
        undefined,
      );
    });

    it('should delete a transaction with recurrence scope', async () => {
      const queryDto = { recurrenceScope: 'CURRENT_ONLY' };
      transactionsService.removeTransaction.mockResolvedValue(undefined);
      const actualResult = await controller.removeTransaction(
        mockRequest as any,
        mockTransactionId,
        queryDto,
      );
      expect(actualResult).toEqual({
        message: 'Transaction deleted successfully',
      });
      expect(transactionsService.removeTransaction).toHaveBeenCalledWith(
        mockUserId,
        mockTransactionId,
        queryDto,
      );
    });
  });

  describe('test', () => {
    it('should return test message', () => {
      const actualResult = controller.test();

      expect(actualResult).toEqual({
        message: 'Transactions module is working correctly',
      });
    });
  });
});

