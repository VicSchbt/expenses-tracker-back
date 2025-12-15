import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './models/create-category.dto';
import { UpdateCategoryDto } from './models/update-category.dto';
import { Category } from './models/category.type';
import { Transaction } from '../transactions/models/transaction.type';
import { GetCategoryTransactionsQueryDto } from './models/get-category-transactions-query.dto';

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
        budget: createCategoryDto.budget,
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
        budget: updateCategoryDto.budget,
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

  async getTransactions(
    userId: string,
    categoryId: string,
    queryDto?: GetCategoryTransactionsQueryDto,
  ): Promise<Transaction[]> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have access to this category');
    }
    const now = new Date();
    let year = queryDto?.year;
    let month = queryDto?.month;
    if (year && !month) {
      throw new BadRequestException('Month is required when year is provided');
    }
    if (month && !year) {
      year = now.getFullYear();
    }
    const whereClause: any = {
      userId,
      categoryId,
    };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
    });
    return transactions.map((transaction) =>
      this.mapToTransactionType(transaction),
    );
  }

  private mapToTransactionType(transaction: any): Transaction {
    return {
      id: transaction.id,
      userId: transaction.userId,
      label: transaction.label,
      date: transaction.date,
      value: Number(transaction.value),
      type: transaction.type,
      categoryId: transaction.categoryId,
      goalId: transaction.goalId,
      recurrence: transaction.recurrence,
      recurrenceCount: transaction.recurrenceCount,
      recurrenceEndDate: transaction.recurrenceEndDate,
      parentTransactionId: transaction.parentTransactionId,
      occurrenceNumber: null,
      isPaid: transaction.isPaid,
      isAuto: transaction.isAuto,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  private mapToCategoryType(category: {
    id: string;
    userId: string;
    label: string;
    icon: string | null;
    color: string | null;
    budget: any;
  }): Category {
    return {
      id: category.id,
      userId: category.userId,
      label: category.label,
      icon: category.icon,
      color: category.color,
      budget:
        category.budget !== null && category.budget !== undefined
          ? Number(category.budget)
          : null,
    };
  }
}
