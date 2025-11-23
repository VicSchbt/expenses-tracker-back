import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './models/create-category.dto';
import { UpdateCategoryDto } from './models/update-category.dto';
import { Category } from './models/category.type';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        userId,
        label: createCategoryDto.label,
        icon: createCategoryDto.icon,
        color: createCategoryDto.color,
      },
    });
    return this.mapToCategoryType(category);
  }

  async findAll(userId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { userId },
    });
    return categories.map((category) => this.mapToCategoryType(category));
  }

  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
    return this.mapToCategoryType(category);
  }

  async update(
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
    if (existingCategory.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        label: updateCategoryDto.label,
        icon: updateCategoryDto.icon,
        color: updateCategoryDto.color,
      },
    });
    return this.mapToCategoryType(category);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }
    if (existingCategory.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
    await this.prisma.category.delete({
      where: { id },
    });
  }

  private mapToCategoryType(category: {
    id: string;
    userId: string;
    label: string;
    icon: string | null;
    color: string | null;
  }): Category {
    return {
      id: category.id,
      userId: category.userId,
      label: category.label,
      icon: category.icon,
      color: category.color,
    };
  }
}
