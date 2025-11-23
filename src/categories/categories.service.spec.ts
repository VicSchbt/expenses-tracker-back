import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './models/create-category.dto';
import { UpdateCategoryDto } from './models/update-category.dto';
import { Category } from './models/category.type';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUserId = 'user-id';
  const mockOtherUserId = 'other-user-id';
  const mockCategoryId = 'category-id';

  const mockCategory = {
    id: mockCategoryId,
    userId: mockUserId,
    label: 'Test Category',
    icon: 'test-icon',
    color: '#FF0000',
  };

  const mockCategoryWithNulls = {
    id: mockCategoryId,
    userId: mockUserId,
    label: 'Test Category',
    icon: null,
    color: null,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCategoryDto: CreateCategoryDto = {
      label: 'Test Category',
      icon: 'test-icon',
      color: '#FF0000',
    };

    it('should create a category successfully with all fields', async () => {
      (prismaService.category.create as jest.Mock).mockResolvedValue(
        mockCategory,
      );

      const result = await service.create(mockUserId, createCategoryDto);

      expect(result).toEqual({
        id: mockCategoryId,
        userId: mockUserId,
        label: 'Test Category',
        icon: 'test-icon',
        color: '#FF0000',
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: createCategoryDto.label,
          icon: createCategoryDto.icon,
          color: createCategoryDto.color,
        },
      });
    });

    it('should create a category successfully with only label', async () => {
      const createDto: CreateCategoryDto = {
        label: 'Test Category',
      };
      (prismaService.category.create as jest.Mock).mockResolvedValue(
        mockCategoryWithNulls,
      );

      const result = await service.create(mockUserId, createDto);

      expect(result).toEqual({
        id: mockCategoryId,
        userId: mockUserId,
        label: 'Test Category',
        icon: null,
        color: null,
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          label: createDto.label,
          icon: undefined,
          color: undefined,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      const mockCategories = [
        mockCategory,
        {
          id: 'category-id-2',
          userId: mockUserId,
          label: 'Another Category',
          icon: null,
          color: '#00FF00',
        },
      ];
      (prismaService.category.findMany as jest.Mock).mockResolvedValue(
        mockCategories,
      );

      const result = await service.findAll(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockCategoryId,
        userId: mockUserId,
        label: 'Test Category',
        icon: 'test-icon',
        color: '#FF0000',
      });
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    it('should return empty array when user has no categories', async () => {
      (prismaService.category.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category when found and user owns it', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );

      const result = await service.findOne(mockUserId, mockCategoryId);

      expect(result).toEqual({
        id: mockCategoryId,
        userId: mockUserId,
        label: 'Test Category',
        icon: 'test-icon',
        color: '#FF0000',
      });
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOne(mockUserId, mockCategoryId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
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
        service.findOne(mockUserId, mockCategoryId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
    });
  });

  describe('update', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      label: 'Updated Category',
      icon: 'updated-icon',
      color: '#0000FF',
    };

    it('should update a category successfully when user owns it', async () => {
      const updatedCategory = {
        ...mockCategory,
        ...updateCategoryDto,
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (prismaService.category.update as jest.Mock).mockResolvedValue(
        updatedCategory,
      );

      const result = await service.update(
        mockUserId,
        mockCategoryId,
        updateCategoryDto,
      );

      expect(result).toEqual({
        id: mockCategoryId,
        userId: mockUserId,
        label: 'Updated Category',
        icon: 'updated-icon',
        color: '#0000FF',
      });
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
        data: updateCategoryDto,
      });
    });

    it('should update a category with partial data', async () => {
      const partialUpdate: UpdateCategoryDto = {
        label: 'Updated Label Only',
      };
      const updatedCategory = {
        ...mockCategory,
        label: 'Updated Label Only',
      };
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (prismaService.category.update as jest.Mock).mockResolvedValue(
        updatedCategory,
      );

      const result = await service.update(
        mockUserId,
        mockCategoryId,
        partialUpdate,
      );

      expect(result.label).toBe('Updated Label Only');
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
        data: partialUpdate,
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(mockUserId, mockCategoryId, updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.category.update).not.toHaveBeenCalled();
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
        service.update(mockUserId, mockCategoryId, updateCategoryDto),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.category.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a category successfully when user owns it', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (prismaService.category.delete as jest.Mock).mockResolvedValue(
        mockCategory,
      );

      await service.remove(mockUserId, mockCategoryId);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.remove(mockUserId, mockCategoryId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.category.delete).not.toHaveBeenCalled();
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
        service.remove(mockUserId, mockCategoryId),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaService.category.delete).not.toHaveBeenCalled();
    });
  });
});

