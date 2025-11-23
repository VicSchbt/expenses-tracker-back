import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './models/create-category.dto';
import { UpdateCategoryDto } from './models/update-category.dto';
import { Category } from './models/category.type';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: jest.Mocked<CategoriesService>;

  const mockUserId = 'user-id';
  const mockCategoryId = 'category-id';

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
  };

  const mockCategory: Category = {
    id: mockCategoryId,
    userId: mockUserId,
    label: 'Test Category',
    icon: 'test-icon',
    color: '#FF0000',
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const mockCategoriesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        label: 'Test Category',
        icon: 'test-icon',
        color: '#FF0000',
      };

      categoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(
        mockRequest as any,
        createCategoryDto,
      );

      expect(result).toEqual(mockCategory);
      expect(categoriesService.create).toHaveBeenCalledWith(
        mockUserId,
        createCategoryDto,
      );
    });

    it('should create a category with only label', async () => {
      const createCategoryDto: CreateCategoryDto = {
        label: 'Test Category',
      };
      const categoryWithoutOptional: Category = {
        ...mockCategory,
        icon: null,
        color: null,
      };

      categoriesService.create.mockResolvedValue(categoryWithoutOptional);

      const result = await controller.create(
        mockRequest as any,
        createCategoryDto,
      );

      expect(result).toEqual(categoryWithoutOptional);
      expect(categoriesService.create).toHaveBeenCalledWith(
        mockUserId,
        createCategoryDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories for the user', async () => {
      const mockCategories: Category[] = [
        mockCategory,
        {
          id: 'category-id-2',
          userId: mockUserId,
          label: 'Another Category',
          icon: null,
          color: '#00FF00',
        },
      ];

      categoriesService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll(mockRequest as any);

      expect(result).toEqual(mockCategories);
      expect(categoriesService.findAll).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty array when user has no categories', async () => {
      categoriesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest as any);

      expect(result).toEqual([]);
      expect(categoriesService.findAll).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      categoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockRequest as any, mockCategoryId);

      expect(result).toEqual(mockCategory);
      expect(categoriesService.findOne).toHaveBeenCalledWith(
        mockUserId,
        mockCategoryId,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        label: 'Updated Category',
        icon: 'updated-icon',
        color: '#0000FF',
      };
      const updatedCategory: Category = {
        ...mockCategory,
        ...updateCategoryDto,
      };

      categoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(
        mockRequest as any,
        mockCategoryId,
        updateCategoryDto,
      );

      expect(result).toEqual(updatedCategory);
      expect(categoriesService.update).toHaveBeenCalledWith(
        mockUserId,
        mockCategoryId,
        updateCategoryDto,
      );
    });

    it('should update a category with partial data', async () => {
      const partialUpdate: UpdateCategoryDto = {
        label: 'Updated Label Only',
      };
      const updatedCategory: Category = {
        ...mockCategory,
        label: 'Updated Label Only',
      };

      categoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(
        mockRequest as any,
        mockCategoryId,
        partialUpdate,
      );

      expect(result).toEqual(updatedCategory);
      expect(categoriesService.update).toHaveBeenCalledWith(
        mockUserId,
        mockCategoryId,
        partialUpdate,
      );
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      categoriesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockRequest as any, mockCategoryId);

      expect(result).toEqual({ message: 'Category deleted successfully' });
      expect(categoriesService.remove).toHaveBeenCalledWith(
        mockUserId,
        mockCategoryId,
      );
    });
  });

  describe('test', () => {
    it('should return test message', () => {
      const result = controller.test();

      expect(result).toEqual({
        message: 'Categories module is working correctly',
      });
    });
  });
});

