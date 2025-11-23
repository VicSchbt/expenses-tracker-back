import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSavingsGoalDto } from './models/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './models/update-savings-goal.dto';

describe('SavingsGoalsService', () => {
  let service: SavingsGoalsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUserId = 'user-id';
  const mockOtherUserId = 'other-user-id';
  const mockGoalId = 'goal-id';

  const mockSavingsGoal = {
    id: mockGoalId,
    userId: mockUserId,
    name: 'Vacation',
    targetAmount: 5000,
    currentAmount: 1000,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
  };

  const mockSavingsGoalWithoutDueDate = {
    id: mockGoalId,
    userId: mockUserId,
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 0,
    dueDate: null,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      savingsGoal: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsGoalsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SavingsGoalsService>(SavingsGoalsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const inputCreateSavingsGoalDto: CreateSavingsGoalDto = {
      name: 'Vacation',
      targetAmount: 5000,
      dueDate: '2024-12-31T00:00:00.000Z',
    };

    it('should create a savings goal successfully with all fields', async () => {
      (prismaService.savingsGoal.create as jest.Mock).mockResolvedValue(
        mockSavingsGoal,
      );

      const actualResult = await service.create(
        mockUserId,
        inputCreateSavingsGoalDto,
      );

      expect(actualResult).toEqual({
        id: mockGoalId,
        userId: mockUserId,
        name: 'Vacation',
        targetAmount: 5000,
        currentAmount: 1000,
        dueDate: new Date('2024-12-31'),
        createdAt: mockSavingsGoal.createdAt,
      });
      expect(prismaService.savingsGoal.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          name: inputCreateSavingsGoalDto.name,
          targetAmount: inputCreateSavingsGoalDto.targetAmount,
          dueDate: new Date(inputCreateSavingsGoalDto.dueDate),
        },
      });
    });

    it('should create a savings goal successfully without due date', async () => {
      const inputDtoWithoutDueDate: CreateSavingsGoalDto = {
        name: 'Emergency Fund',
        targetAmount: 10000,
      };
      (prismaService.savingsGoal.create as jest.Mock).mockResolvedValue(
        mockSavingsGoalWithoutDueDate,
      );

      const actualResult = await service.create(
        mockUserId,
        inputDtoWithoutDueDate,
      );

      expect(actualResult).toEqual({
        id: mockGoalId,
        userId: mockUserId,
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 0,
        dueDate: null,
        createdAt: mockSavingsGoalWithoutDueDate.createdAt,
      });
      expect(prismaService.savingsGoal.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          name: inputDtoWithoutDueDate.name,
          targetAmount: inputDtoWithoutDueDate.targetAmount,
          dueDate: null,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all savings goals for a user', async () => {
      const mockGoals = [
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
      (prismaService.savingsGoal.findMany as jest.Mock).mockResolvedValue(
        mockGoals,
      );

      const actualResult = await service.findAll(mockUserId);

      expect(actualResult).toHaveLength(2);
      expect(actualResult[0]).toEqual({
        id: mockGoalId,
        userId: mockUserId,
        name: 'Vacation',
        targetAmount: 5000,
        currentAmount: 1000,
        dueDate: new Date('2024-12-31'),
        createdAt: mockSavingsGoal.createdAt,
      });
      expect(prismaService.savingsGoal.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    it('should return empty array when user has no savings goals', async () => {
      (prismaService.savingsGoal.findMany as jest.Mock).mockResolvedValue([]);

      const actualResult = await service.findAll(mockUserId);

      expect(actualResult).toEqual([]);
      expect(prismaService.savingsGoal.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe('findOne', () => {
    it('should return a savings goal when found and user owns it', async () => {
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        mockSavingsGoal,
      );

      const actualResult = await service.findOne(mockUserId, mockGoalId);

      expect(actualResult).toEqual({
        id: mockGoalId,
        userId: mockUserId,
        name: 'Vacation',
        targetAmount: 5000,
        currentAmount: 1000,
        dueDate: new Date('2024-12-31'),
        createdAt: mockSavingsGoal.createdAt,
      });
      expect(prismaService.savingsGoal.findUnique).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      });
    });

    it('should throw NotFoundException when savings goal does not exist', async () => {
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(mockUserId, mockGoalId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.savingsGoal.findUnique).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      });
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
        service.findOne(mockUserId, mockGoalId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.savingsGoal.findUnique).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      });
    });
  });

  describe('update', () => {
    const inputUpdateSavingsGoalDto: UpdateSavingsGoalDto = {
      name: 'Updated Vacation',
      targetAmount: 6000,
      dueDate: '2025-12-31T00:00:00.000Z',
    };

    it('should update a savings goal successfully when user owns it', async () => {
      const updatedGoal = {
        ...mockSavingsGoal,
        name: inputUpdateSavingsGoalDto.name,
        targetAmount: inputUpdateSavingsGoalDto.targetAmount,
        dueDate: new Date(inputUpdateSavingsGoalDto.dueDate!),
      };
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        mockSavingsGoal,
      );
      (prismaService.savingsGoal.update as jest.Mock).mockResolvedValue(
        updatedGoal,
      );

      const actualResult = await service.update(
        mockUserId,
        mockGoalId,
        inputUpdateSavingsGoalDto,
      );

      expect(actualResult.name).toBe('Updated Vacation');
      expect(actualResult.targetAmount).toBe(6000);
      expect(prismaService.savingsGoal.findUnique).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      });
      expect(prismaService.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: mockGoalId },
        data: {
          name: inputUpdateSavingsGoalDto.name,
          targetAmount: inputUpdateSavingsGoalDto.targetAmount,
          dueDate: new Date(inputUpdateSavingsGoalDto.dueDate!),
        },
      });
    });

    it('should update a savings goal with partial data', async () => {
      const partialUpdate: UpdateSavingsGoalDto = {
        name: 'Updated Name Only',
      };
      const updatedGoal = {
        ...mockSavingsGoal,
        name: 'Updated Name Only',
      };
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        mockSavingsGoal,
      );
      (prismaService.savingsGoal.update as jest.Mock).mockResolvedValue(
        updatedGoal,
      );

      const actualResult = await service.update(
        mockUserId,
        mockGoalId,
        partialUpdate,
      );

      expect(actualResult.name).toBe('Updated Name Only');
      expect(prismaService.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: mockGoalId },
        data: partialUpdate,
      });
    });

    it('should throw NotFoundException when savings goal does not exist', async () => {
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.update(mockUserId, mockGoalId, inputUpdateSavingsGoalDto),
      ).rejects.toThrow(NotFoundException);
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
        service.update(mockUserId, mockGoalId, inputUpdateSavingsGoalDto),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.savingsGoal.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a savings goal successfully when user owns it', async () => {
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        mockSavingsGoal,
      );
      (prismaService.savingsGoal.delete as jest.Mock).mockResolvedValue(
        mockSavingsGoal,
      );

      await service.remove(mockUserId, mockGoalId);

      expect(prismaService.savingsGoal.findUnique).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      });
      expect(prismaService.savingsGoal.delete).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      });
    });

    it('should throw NotFoundException when savings goal does not exist', async () => {
      (prismaService.savingsGoal.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.remove(mockUserId, mockGoalId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.savingsGoal.delete).not.toHaveBeenCalled();
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
        service.remove(mockUserId, mockGoalId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.savingsGoal.delete).not.toHaveBeenCalled();
    });
  });
});

