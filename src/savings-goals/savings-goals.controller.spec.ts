import { Test, TestingModule } from '@nestjs/testing';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './models/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './models/update-savings-goal.dto';
import { SavingsGoal } from './models/savings-goal.type';

describe('SavingsGoalsController', () => {
  let controller: SavingsGoalsController;
  let savingsGoalsService: jest.Mocked<SavingsGoalsService>;

  const mockUserId = 'user-id';
  const mockGoalId = 'goal-id';

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockSavingsGoal: SavingsGoal = {
    id: mockGoalId,
    userId: mockUserId,
    name: 'Vacation',
    targetAmount: 5000,
    currentAmount: 1000,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockSavingsGoalsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsGoalsController],
      providers: [
        {
          provide: SavingsGoalsService,
          useValue: mockSavingsGoalsService,
        },
      ],
    }).compile();

    controller = module.get<SavingsGoalsController>(SavingsGoalsController);
    savingsGoalsService = module.get(SavingsGoalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a savings goal', async () => {
      const inputCreateSavingsGoalDto: CreateSavingsGoalDto = {
        name: 'Vacation',
        targetAmount: 5000,
        dueDate: '2024-12-31T00:00:00.000Z',
      };

      savingsGoalsService.create.mockResolvedValue(mockSavingsGoal);

      const actualResult = await controller.create(
        mockRequest as any,
        inputCreateSavingsGoalDto,
      );

      expect(actualResult).toEqual(mockSavingsGoal);
      expect(savingsGoalsService.create).toHaveBeenCalledWith(
        mockUserId,
        inputCreateSavingsGoalDto,
      );
    });

    it('should create a savings goal without due date', async () => {
      const inputCreateSavingsGoalDto: CreateSavingsGoalDto = {
        name: 'Emergency Fund',
        targetAmount: 10000,
      };
      const goalWithoutDueDate: SavingsGoal = {
        ...mockSavingsGoal,
        dueDate: null,
      };

      savingsGoalsService.create.mockResolvedValue(goalWithoutDueDate);

      const actualResult = await controller.create(
        mockRequest as any,
        inputCreateSavingsGoalDto,
      );

      expect(actualResult).toEqual(goalWithoutDueDate);
      expect(savingsGoalsService.create).toHaveBeenCalledWith(
        mockUserId,
        inputCreateSavingsGoalDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all savings goals for the user', async () => {
      const mockGoals: SavingsGoal[] = [
        mockSavingsGoal,
        {
          id: 'goal-id-2',
          userId: mockUserId,
          name: 'New Car',
          targetAmount: 20000,
          currentAmount: 5000,
          dueDate: null,
          createdAt: new Date('2024-01-01'),
        },
      ];

      savingsGoalsService.findAll.mockResolvedValue(mockGoals);

      const actualResult = await controller.findAll(mockRequest as any);

      expect(actualResult).toEqual(mockGoals);
      expect(savingsGoalsService.findAll).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty array when user has no savings goals', async () => {
      savingsGoalsService.findAll.mockResolvedValue([]);

      const actualResult = await controller.findAll(mockRequest as any);

      expect(actualResult).toEqual([]);
      expect(savingsGoalsService.findAll).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('findOne', () => {
    it('should return a savings goal by id', async () => {
      savingsGoalsService.findOne.mockResolvedValue(mockSavingsGoal);

      const actualResult = await controller.findOne(
        mockRequest as any,
        mockGoalId,
      );

      expect(actualResult).toEqual(mockSavingsGoal);
      expect(savingsGoalsService.findOne).toHaveBeenCalledWith(
        mockUserId,
        mockGoalId,
      );
    });
  });

  describe('update', () => {
    it('should update a savings goal', async () => {
      const inputUpdateSavingsGoalDto: UpdateSavingsGoalDto = {
        name: 'Updated Vacation',
        targetAmount: 6000,
      };
      const updatedGoal: SavingsGoal = {
        ...mockSavingsGoal,
        ...inputUpdateSavingsGoalDto,
      };

      savingsGoalsService.update.mockResolvedValue(updatedGoal);

      const actualResult = await controller.update(
        mockRequest as any,
        mockGoalId,
        inputUpdateSavingsGoalDto,
      );

      expect(actualResult).toEqual(updatedGoal);
      expect(savingsGoalsService.update).toHaveBeenCalledWith(
        mockUserId,
        mockGoalId,
        inputUpdateSavingsGoalDto,
      );
    });

    it('should update a savings goal with partial data', async () => {
      const partialUpdate: UpdateSavingsGoalDto = {
        name: 'Updated Name Only',
      };
      const updatedGoal: SavingsGoal = {
        ...mockSavingsGoal,
        name: 'Updated Name Only',
      };

      savingsGoalsService.update.mockResolvedValue(updatedGoal);

      const actualResult = await controller.update(
        mockRequest as any,
        mockGoalId,
        partialUpdate,
      );

      expect(actualResult).toEqual(updatedGoal);
      expect(savingsGoalsService.update).toHaveBeenCalledWith(
        mockUserId,
        mockGoalId,
        partialUpdate,
      );
    });
  });

  describe('remove', () => {
    it('should delete a savings goal', async () => {
      savingsGoalsService.remove.mockResolvedValue(undefined);

      const actualResult = await controller.remove(
        mockRequest as any,
        mockGoalId,
      );

      expect(actualResult).toEqual({
        message: 'Savings goal deleted successfully',
      });
      expect(savingsGoalsService.remove).toHaveBeenCalledWith(
        mockUserId,
        mockGoalId,
      );
    });
  });

  describe('test', () => {
    it('should return test message', () => {
      const actualResult = controller.test();

      expect(actualResult).toEqual({
        message: 'Savings goals module is working correctly',
      });
    });
  });
});

