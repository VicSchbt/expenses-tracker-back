import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from 'prisma/prisma.service';
import { TransactionType, Recurrence } from '@prisma/client';
import { UpdateTransactionDto } from './models/update-transaction.dto';
import { DeleteTransactionQueryDto } from './models/delete-transaction-query.dto';
import { RecurrenceScope } from './models/recurrence-scope.enum';
import { CreateIncomeDto } from './models/create-income.dto';
import { CreateBillDto } from './models/create-bill.dto';
import { CreateSubscriptionDto } from './models/create-subscription.dto';
import { CreateSavingDto } from './models/create-saving.dto';
import { CreateExpenseDto } from './models/create-expense.dto';
import { CreateRefundDto } from './models/create-refund.dto';
import { GetIncomeQueryDto } from './models/get-income-query.dto';
import { GetBillsQueryDto } from './models/get-bills-query.dto';
import { GetSubscriptionsQueryDto } from './models/get-subscriptions-query.dto';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUserId = 'user-id';
  const mockOtherUserId = 'other-user-id';
  const mockCategoryId = 'category-id';
  const mockGoalId = 'goal-id';
  const mockTransactionId = 'transaction-id';

  const mockDate = '2024-01-15T10:00:00.000Z';

  const mockCategory = {
    id: mockCategoryId,
    userId: mockUserId,
    label: 'Test Category',
    icon: 'test-icon',
    color: '#FF0000',
  };

  const mockSavingsGoal = {
    id: mockGoalId,
    userId: mockUserId,
    name: 'Vacation',
    targetAmount: 5000,
    currentAmount: 1000,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date(),
  };

  const mockTransaction = {
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
    const mockPrismaService = {
      transaction: {
        create: jest.fn(),
        createMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
      },
      savingsGoal: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIncome', () => {
    const inputCreateIncomeDto: CreateIncomeDto = {
      label: 'Salary',
      date: mockDate,
      value: 5000,
      recurrence: Recurrence.MONTHLY,
    };

    it('should create an income transaction successfully with recurrence and generate future instances', async () => {
      const expectedTransaction = {
        ...mockTransaction,
        label: inputCreateIncomeDto.label,
        value: inputCreateIncomeDto.value,
        type: TransactionType.INCOME,
        recurrence: inputCreateIncomeDto.recurrence,
        recurrenceEndDate: null,
        parentTransactionId: null,
      };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );
      (prismaService.transaction.createMany as jest.Mock).mockResolvedValue({
        count: 12,
      });

      const actualResult = await service.createIncome(
        mockUserId,
        inputCreateIncomeDto,
      );

      expect(actualResult).toEqual({
        id: mockTransactionId,
        userId: mockUserId,
        label: inputCreateIncomeDto.label,
        date: new Date(mockDate),
        value: inputCreateIncomeDto.value,
        type: TransactionType.INCOME,
        categoryId: null,
        goalId: null,
        recurrence: inputCreateIncomeDto.recurrence,
        recurrenceEndDate: null,
        parentTransactionId: null,
        isPaid: null,
        dueDate: null,
        createdAt: expectedTransaction.createdAt,
        updatedAt: expectedTransaction.updatedAt,
      });
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputCreateIncomeDto.label,
          date: new Date(inputCreateIncomeDto.date),
          value: inputCreateIncomeDto.value,
          type: TransactionType.INCOME,
          recurrence: inputCreateIncomeDto.recurrence,
          recurrenceEndDate: null,
        },
      });
      expect(prismaService.transaction.createMany).toHaveBeenCalled();
    });

    it('should create an income transaction successfully without recurrence', async () => {
      const inputDtoWithoutRecurrence: CreateIncomeDto = {
        label: 'Bonus',
        date: mockDate,
        value: 1000,
      };
      const expectedTransaction = {
        ...mockTransaction,
        label: inputDtoWithoutRecurrence.label,
        value: inputDtoWithoutRecurrence.value,
        type: TransactionType.INCOME,
        recurrence: null,
      };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );

      const actualResult = await service.createIncome(
        mockUserId,
        inputDtoWithoutRecurrence,
      );

      expect(actualResult.type).toBe(TransactionType.INCOME);
      expect(actualResult.recurrence).toBeNull();
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputDtoWithoutRecurrence.label,
          date: new Date(inputDtoWithoutRecurrence.date),
          value: inputDtoWithoutRecurrence.value,
          type: TransactionType.INCOME,
          recurrence: undefined,
          recurrenceEndDate: null,
        },
      });
      expect(prismaService.transaction.createMany).not.toHaveBeenCalled();
    });

    it('should create an income transaction with recurrenceEndDate', async () => {
      const inputDtoWithEndDate: CreateIncomeDto = {
        label: 'Salary',
        date: mockDate,
        value: 5000,
        recurrence: Recurrence.MONTHLY,
        recurrenceEndDate: '2024-12-31',
      };
      const expectedTransaction = {
        ...mockTransaction,
        label: inputDtoWithEndDate.label,
        value: inputDtoWithEndDate.value,
        type: TransactionType.INCOME,
        recurrence: inputDtoWithEndDate.recurrence,
        recurrenceEndDate: new Date(inputDtoWithEndDate.recurrenceEndDate),
      };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );
      (prismaService.transaction.createMany as jest.Mock).mockResolvedValue({
        count: 11,
      });

      await service.createIncome(mockUserId, inputDtoWithEndDate);

      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputDtoWithEndDate.label,
          date: new Date(inputDtoWithEndDate.date),
          value: inputDtoWithEndDate.value,
          type: TransactionType.INCOME,
          recurrence: inputDtoWithEndDate.recurrence,
          recurrenceEndDate: new Date(inputDtoWithEndDate.recurrenceEndDate),
        },
      });
    });
  });

  describe('createBill', () => {
    const inputCreateBillDto: CreateBillDto = {
      label: 'Electricity Bill',
      date: mockDate,
      value: 150,
      recurrence: Recurrence.MONTHLY,
    };

    it('should create a bill transaction successfully', async () => {
      const expectedTransaction = {
        ...mockTransaction,
        label: inputCreateBillDto.label,
        value: inputCreateBillDto.value,
        type: TransactionType.BILL,
        recurrence: inputCreateBillDto.recurrence,
      };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );

      const actualResult = await service.createBill(
        mockUserId,
        inputCreateBillDto,
      );

      expect(actualResult.type).toBe(TransactionType.BILL);
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputCreateBillDto.label,
          date: new Date(inputCreateBillDto.date),
          value: inputCreateBillDto.value,
          type: TransactionType.BILL,
          recurrence: inputCreateBillDto.recurrence,
          recurrenceEndDate: null,
        },
      });
      expect(prismaService.transaction.createMany).toHaveBeenCalled();
    });
  });

  describe('createSubscription', () => {
    const inputCreateSubscriptionDto: CreateSubscriptionDto = {
      label: 'Netflix',
      date: mockDate,
      value: 15,
      recurrence: Recurrence.MONTHLY,
    };

    it('should create a subscription transaction successfully', async () => {
      const expectedTransaction = {
        ...mockTransaction,
        label: inputCreateSubscriptionDto.label,
        value: inputCreateSubscriptionDto.value,
        type: TransactionType.SUBSCRIPTION,
        recurrence: inputCreateSubscriptionDto.recurrence,
      };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );

      const actualResult = await service.createSubscription(
        mockUserId,
        inputCreateSubscriptionDto,
      );

      expect(actualResult.type).toBe(TransactionType.SUBSCRIPTION);
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputCreateSubscriptionDto.label,
          date: new Date(inputCreateSubscriptionDto.date),
          value: inputCreateSubscriptionDto.value,
          type: TransactionType.SUBSCRIPTION,
          recurrence: inputCreateSubscriptionDto.recurrence,
          recurrenceEndDate: null,
        },
      });
      expect(prismaService.transaction.createMany).toHaveBeenCalled();
    });
  });

  describe('createSaving', () => {
    const inputCreateSavingDto: CreateSavingDto = {
      goalId: mockGoalId,
      value: 500,
      date: mockDate,
    };

    it('should create a saving transaction and update savings goal successfully', async () => {
      const expectedTransaction = {
        ...mockTransaction,
        label: `Saving to ${mockSavingsGoal.name}`,
        value: inputCreateSavingDto.value,
        type: TransactionType.SAVINGS,
        goalId: mockGoalId,
      };
      const updatedGoal = {
        ...mockSavingsGoal,
        currentAmount: mockSavingsGoal.currentAmount + inputCreateSavingDto.value,
      };
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        mockSavingsGoal,
      );
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );
      (prismaService.savingsGoal.update as jest.Mock).mockResolvedValue(
        updatedGoal,
      );

      const actualResult = await service.createSaving(
        mockUserId,
        inputCreateSavingDto,
      );

      expect(actualResult.type).toBe(TransactionType.SAVINGS);
      expect(actualResult.goalId).toBe(mockGoalId);
      expect(prismaService.savingsGoal.findUnique).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      });
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: `Saving to ${mockSavingsGoal.name}`,
          date: new Date(inputCreateSavingDto.date),
          value: inputCreateSavingDto.value,
          type: TransactionType.SAVINGS,
          goalId: mockGoalId,
        },
      });
      expect(prismaService.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: mockGoalId },
        data: {
          currentAmount: {
            increment: inputCreateSavingDto.value,
          },
        },
      });
    });

    it('should throw NotFoundException when savings goal does not exist', async () => {
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.createSaving(mockUserId, inputCreateSavingDto),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.transaction.create).not.toHaveBeenCalled();
      expect(prismaService.savingsGoal.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the savings goal', async () => {
      const otherUserGoal = {
        ...mockSavingsGoal,
        userId: mockOtherUserId,
      };
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        otherUserGoal,
      );

      await expect(
        service.createSaving(mockUserId, inputCreateSavingDto),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.transaction.create).not.toHaveBeenCalled();
      expect(prismaService.savingsGoal.update).not.toHaveBeenCalled();
    });
  });

  describe('createExpense', () => {
    const inputCreateExpenseDto: CreateExpenseDto = {
      label: 'Groceries',
      date: mockDate,
      value: 75,
      categoryId: mockCategoryId,
    };

    it('should create an expense transaction successfully with category', async () => {
      const expectedTransaction = {
        ...mockTransaction,
        label: inputCreateExpenseDto.label,
        value: inputCreateExpenseDto.value,
        type: TransactionType.EXPENSE,
        categoryId: mockCategoryId,
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );

      const actualResult = await service.createExpense(
        mockUserId,
        inputCreateExpenseDto,
      );

      expect(actualResult.type).toBe(TransactionType.EXPENSE);
      expect(actualResult.categoryId).toBe(mockCategoryId);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputCreateExpenseDto.label,
          date: new Date(inputCreateExpenseDto.date),
          value: inputCreateExpenseDto.value,
          type: TransactionType.EXPENSE,
          categoryId: mockCategoryId,
        },
      });
    });

    it('should create an expense transaction successfully without category', async () => {
      const inputDtoWithoutCategory: CreateExpenseDto = {
        label: 'Miscellaneous',
        date: mockDate,
        value: 25,
      };
      const expectedTransaction = {
        ...mockTransaction,
        label: inputDtoWithoutCategory.label,
        value: inputDtoWithoutCategory.value,
        type: TransactionType.EXPENSE,
        categoryId: null,
      };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );

      const actualResult = await service.createExpense(
        mockUserId,
        inputDtoWithoutCategory,
      );

      expect(actualResult.type).toBe(TransactionType.EXPENSE);
      expect(actualResult.categoryId).toBeNull();
      expect(prismaService.category.findUnique).not.toHaveBeenCalled();
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputDtoWithoutCategory.label,
          date: new Date(inputDtoWithoutCategory.date),
          value: inputDtoWithoutCategory.value,
          type: TransactionType.EXPENSE,
          categoryId: undefined,
        },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createExpense(mockUserId, inputCreateExpenseDto),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the category', async () => {
      const otherUserCategory = {
        ...mockCategory,
        userId: mockOtherUserId,
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        otherUserCategory,
      );

      await expect(
        service.createExpense(mockUserId, inputCreateExpenseDto),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('createRefund', () => {
    const inputCreateRefundDto: CreateRefundDto = {
      label: 'Clothing Refund',
      date: mockDate,
      value: 50,
      categoryId: mockCategoryId,
    };

    it('should create a refund transaction successfully', async () => {
      const expectedTransaction = {
        ...mockTransaction,
        label: inputCreateRefundDto.label,
        value: inputCreateRefundDto.value,
        type: TransactionType.REFUND,
        categoryId: mockCategoryId,
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        expectedTransaction,
      );

      const actualResult = await service.createRefund(
        mockUserId,
        inputCreateRefundDto,
      );

      expect(actualResult.type).toBe(TransactionType.REFUND);
      expect(actualResult.categoryId).toBe(mockCategoryId);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: inputCreateRefundDto.label,
          date: new Date(inputCreateRefundDto.date),
          value: inputCreateRefundDto.value,
          type: TransactionType.REFUND,
          categoryId: mockCategoryId,
        },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createRefund(mockUserId, inputCreateRefundDto),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the category', async () => {
      const otherUserCategory = {
        ...mockCategory,
        userId: mockOtherUserId,
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        otherUserCategory,
      );

      await expect(
        service.createRefund(mockUserId, inputCreateRefundDto),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction for the owner', async () => {
      const inputUpdateTransactionDto: UpdateTransactionDto = {
        label: 'Updated label',
        value: 200,
      };
      const existingTransaction = { ...mockTransaction, childTransactions: [] };
      const updatedTransaction = {
        ...existingTransaction,
        label: inputUpdateTransactionDto.label,
        value: inputUpdateTransactionDto.value,
      };
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        existingTransaction,
      );
      (prismaService.transaction.update as jest.Mock).mockResolvedValue(
        updatedTransaction,
      );
      const actualResult = await service.updateTransaction(
        mockUserId,
        mockTransactionId,
        inputUpdateTransactionDto,
      );
      expect(actualResult.label).toBe(inputUpdateTransactionDto.label);
      expect(actualResult.value).toBe(inputUpdateTransactionDto.value);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
        include: { childTransactions: true },
      });
      expect(prismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
        data: {
          label: inputUpdateTransactionDto.label,
          value: inputUpdateTransactionDto.value,
        },
      });
    });

    it('should update all recurring transactions when scope is ALL', async () => {
      const parentTransaction = {
        ...mockTransaction,
        recurrence: Recurrence.MONTHLY,
        parentTransactionId: null,
        childTransactions: [],
      };
      const inputUpdateTransactionDto: UpdateTransactionDto = {
        label: 'Updated label',
        recurrenceScope: RecurrenceScope.ALL,
      };
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        parentTransaction,
      );
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue([
        parentTransaction,
      ]);
      (prismaService.transaction.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prismaService.transaction.update as jest.Mock).mockResolvedValue({
        ...parentTransaction,
        label: inputUpdateTransactionDto.label,
      });

      await service.updateTransaction(
        mockUserId,
        mockTransactionId,
        inputUpdateTransactionDto,
      );

      expect(prismaService.transaction.updateMany).toHaveBeenCalled();
    });

    it('should adjust savings goal when updating a savings transaction value', async () => {
      const savingsTransaction = {
        ...mockTransaction,
        type: TransactionType.SAVINGS,
        goalId: mockGoalId,
        value: 100,
      };
      const inputUpdateTransactionDto: UpdateTransactionDto = {
        value: 150,
      };
      const updatedTransaction = {
        ...savingsTransaction,
        value: inputUpdateTransactionDto.value,
      };
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        savingsTransaction,
      );
      (prismaService.transaction.update as jest.Mock).mockResolvedValue(
        updatedTransaction,
      );
      (prismaService.savingsGoal.update as jest.Mock).mockResolvedValue({
        ...mockSavingsGoal,
        currentAmount:
          mockSavingsGoal.currentAmount +
          ((inputUpdateTransactionDto.value as number) - 100),
      });
      const actualResult = await service.updateTransaction(
        mockUserId,
        mockTransactionId,
        inputUpdateTransactionDto,
      );
      expect(actualResult.value).toBe(inputUpdateTransactionDto.value);
      expect(prismaService.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: mockGoalId },
        data: {
          currentAmount: {
            increment: (inputUpdateTransactionDto.value as number) - 100,
          },
        },
      });
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      const inputUpdateTransactionDto: UpdateTransactionDto = {
        label: 'Updated',
      };
      await expect(
        service.updateTransaction(
          mockUserId,
          mockTransactionId,
          inputUpdateTransactionDto,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.transaction.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the transaction', async () => {
      const otherUserTransaction = {
        ...mockTransaction,
        userId: mockOtherUserId,
      };
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        otherUserTransaction,
      );
      const inputUpdateTransactionDto: UpdateTransactionDto = {
        label: 'Updated',
      };
      await expect(
        service.updateTransaction(
          mockUserId,
          mockTransactionId,
          inputUpdateTransactionDto,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.transaction.update).not.toHaveBeenCalled();
    });
  });

  describe('removeTransaction', () => {
    it('should delete a transaction for the owner', async () => {
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue({
        ...mockTransaction,
        childTransactions: [],
      });
      (prismaService.transaction.delete as jest.Mock).mockResolvedValue(
        undefined,
      );
      await service.removeTransaction(mockUserId, mockTransactionId);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
        include: { childTransactions: true },
      });
      expect(prismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
      });
    });

    it('should delete all recurring transactions when scope is ALL', async () => {
      const parentTransaction = {
        ...mockTransaction,
        recurrence: Recurrence.MONTHLY,
        parentTransactionId: null,
        childTransactions: [],
      };
      const queryDto: DeleteTransactionQueryDto = {
        recurrenceScope: RecurrenceScope.ALL,
      };
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        parentTransaction,
      );
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue([
        parentTransaction,
      ]);
      (prismaService.transaction.deleteMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await service.removeTransaction(mockUserId, mockTransactionId, queryDto);

      expect(prismaService.transaction.deleteMany).toHaveBeenCalled();
    });

    it('should adjust savings goal when deleting a savings transaction', async () => {
      const savingsTransaction = {
        ...mockTransaction,
        type: TransactionType.SAVINGS,
        goalId: mockGoalId,
        value: 100,
      };
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        savingsTransaction,
      );
      (prismaService.transaction.delete as jest.Mock).mockResolvedValue(
        undefined,
      );
      await service.removeTransaction(mockUserId, mockTransactionId);
      expect(prismaService.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: mockGoalId },
        data: {
          currentAmount: {
            increment: -100,
          },
        },
      });
      expect(prismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: mockTransactionId },
      });
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(
        service.removeTransaction(mockUserId, mockTransactionId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.transaction.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the transaction', async () => {
      const otherUserTransaction = {
        ...mockTransaction,
        userId: mockOtherUserId,
      };
      (prismaService.transaction.findUnique as jest.Mock).mockResolvedValue(
        otherUserTransaction,
      );
      await expect(
        service.removeTransaction(mockUserId, mockTransactionId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.transaction.delete).not.toHaveBeenCalled();
    });
  });

  describe('getIncome', () => {
    it('should get income transactions with pagination', async () => {
      const queryDto: GetIncomeQueryDto = { page: 1, limit: 20 };
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.INCOME,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      const actualResult = await service.getIncome(mockUserId, queryDto);

      expect(actualResult.data).toHaveLength(1);
      expect(actualResult.page).toBe(1);
      expect(actualResult.limit).toBe(20);
      expect(actualResult.total).toBe(1);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          type: TransactionType.INCOME,
        },
        skip: 0,
        take: 20,
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should filter income transactions by month and year', async () => {
      const queryDto: GetIncomeQueryDto = {
        page: 1,
        limit: 20,
        year: 2024,
        month: 11,
      };
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.INCOME,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      await service.getIncome(mockUserId, queryDto);

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          type: TransactionType.INCOME,
          date: {
            gte: new Date(2024, 10, 1),
            lte: new Date(2024, 11, 0, 23, 59, 59, 999),
          },
        },
        skip: 0,
        take: 20,
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should throw BadRequestException when year is provided without month', async () => {
      const queryDto: GetIncomeQueryDto = {
        page: 1,
        limit: 20,
        year: 2024,
      };

      await expect(
        service.getIncome(mockUserId, queryDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentMonthIncome', () => {
    it('should get current month income transactions', async () => {
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.INCOME,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      const actualResult = await service.getCurrentMonthIncome(
        mockUserId,
        1,
        20,
      );

      expect(actualResult.data).toHaveLength(1);
      expect(actualResult.page).toBe(1);
      expect(actualResult.limit).toBe(20);
      expect(prismaService.transaction.findMany).toHaveBeenCalled();
      const whereClause = (prismaService.transaction.findMany as jest.Mock).mock
        .calls[0][0].where;
      expect(whereClause.userId).toBe(mockUserId);
      expect(whereClause.type).toBe(TransactionType.INCOME);
      expect(whereClause.date).toBeDefined();
    });
  });

  describe('getBills', () => {
    it('should get bill transactions with pagination', async () => {
      const queryDto: GetBillsQueryDto = { page: 1, limit: 20 };
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.BILL,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      const actualResult = await service.getBills(mockUserId, queryDto);

      expect(actualResult.data).toHaveLength(1);
      expect(actualResult.page).toBe(1);
      expect(actualResult.limit).toBe(20);
      expect(actualResult.total).toBe(1);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          type: TransactionType.BILL,
        },
        skip: 0,
        take: 20,
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should filter bill transactions by month and year', async () => {
      const queryDto: GetBillsQueryDto = {
        page: 1,
        limit: 20,
        year: 2024,
        month: 11,
      };
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.BILL,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      await service.getBills(mockUserId, queryDto);

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          type: TransactionType.BILL,
          date: {
            gte: new Date(2024, 10, 1),
            lte: new Date(2024, 11, 0, 23, 59, 59, 999),
          },
        },
        skip: 0,
        take: 20,
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should throw BadRequestException when year is provided without month', async () => {
      const queryDto: GetBillsQueryDto = {
        page: 1,
        limit: 20,
        year: 2024,
      };

      await expect(
        service.getBills(mockUserId, queryDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentMonthBills', () => {
    it('should get current month bill transactions', async () => {
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.BILL,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      const actualResult = await service.getCurrentMonthBills(
        mockUserId,
        1,
        20,
      );

      expect(actualResult.data).toHaveLength(1);
      expect(actualResult.page).toBe(1);
      expect(actualResult.limit).toBe(20);
      expect(prismaService.transaction.findMany).toHaveBeenCalled();
      const whereClause = (prismaService.transaction.findMany as jest.Mock).mock
        .calls[0][0].where;
      expect(whereClause.userId).toBe(mockUserId);
      expect(whereClause.type).toBe(TransactionType.BILL);
      expect(whereClause.date).toBeDefined();
    });
  });

  describe('getSubscriptions', () => {
    it('should get subscription transactions with pagination', async () => {
      const queryDto: GetSubscriptionsQueryDto = { page: 1, limit: 20 };
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.SUBSCRIPTION,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      const actualResult = await service.getSubscriptions(
        mockUserId,
        queryDto,
      );

      expect(actualResult.data).toHaveLength(1);
      expect(actualResult.page).toBe(1);
      expect(actualResult.limit).toBe(20);
      expect(actualResult.total).toBe(1);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          type: TransactionType.SUBSCRIPTION,
        },
        skip: 0,
        take: 20,
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should filter subscription transactions by month and year', async () => {
      const queryDto: GetSubscriptionsQueryDto = {
        page: 1,
        limit: 20,
        year: 2024,
        month: 11,
      };
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.SUBSCRIPTION,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      await service.getSubscriptions(mockUserId, queryDto);

      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          type: TransactionType.SUBSCRIPTION,
          date: {
            gte: new Date(2024, 10, 1),
            lte: new Date(2024, 11, 0, 23, 59, 59, 999),
          },
        },
        skip: 0,
        take: 20,
        orderBy: {
          date: 'desc',
        },
      });
    });

    it('should throw BadRequestException when year is provided without month', async () => {
      const queryDto: GetSubscriptionsQueryDto = {
        page: 1,
        limit: 20,
        year: 2024,
      };

      await expect(
        service.getSubscriptions(mockUserId, queryDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCurrentMonthSubscriptions', () => {
    it('should get current month subscription transactions', async () => {
      const mockTransactions = [
        {
          ...mockTransaction,
          type: TransactionType.SUBSCRIPTION,
        },
      ];
      (prismaService.transaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions,
      );
      (prismaService.transaction.count as jest.Mock).mockResolvedValue(1);

      const actualResult = await service.getCurrentMonthSubscriptions(
        mockUserId,
        1,
        20,
      );

      expect(actualResult.data).toHaveLength(1);
      expect(actualResult.page).toBe(1);
      expect(actualResult.limit).toBe(20);
      expect(prismaService.transaction.findMany).toHaveBeenCalled();
      const whereClause = (prismaService.transaction.findMany as jest.Mock).mock
        .calls[0][0].where;
      expect(whereClause.userId).toBe(mockUserId);
      expect(whereClause.type).toBe(TransactionType.SUBSCRIPTION);
      expect(whereClause.date).toBeDefined();
    });
  });
});

