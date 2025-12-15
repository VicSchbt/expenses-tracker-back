import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './models/create-category.dto';
import { UpdateCategoryDto } from './models/update-category.dto';
import { Category } from './models/category.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Transaction } from '../transactions/models/transaction.type';
import { GetCategoryTransactionsQueryDto } from './models/get-category-transactions-query.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: { user: { id: string; email: string } },
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(req.user.id, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [Category],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Request() req: { user: { id: string; email: string } },
  ): Promise<Category[]> {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Test categories module' })
  @ApiResponse({
    status: 200,
    description: 'Categories module is working correctly',
  })
  test() {
    return { message: 'Categories module is working correctly' };
  }

  @Get(':id/transactions')
  @ApiOperation({
    summary: 'Get all transactions for a category',
    description:
      'Returns transactions for a category. Optionally filter by month and/or year using query parameters.',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for the category',
    type: [Transaction],
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request (e.g., year provided without month)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Query() queryDto: GetCategoryTransactionsQueryDto,
  ): Promise<Transaction[]> {
    return this.categoriesService.getTransactions(req.user.id, id, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category successfully updated',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(req.user.id, id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.categoriesService.remove(req.user.id, id);
    return { message: 'Category deleted successfully' };
  }
}
