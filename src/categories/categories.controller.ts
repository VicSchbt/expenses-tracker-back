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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './models/create-category.dto';
import { UpdateCategoryDto } from './models/update-category.dto';
import { Category } from './models/category.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @Request() req: { user: { id: string; email: string } },
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(req.user.id, createCategoryDto);
  }

  @Get()
  async findAll(
    @Request() req: { user: { id: string; email: string } },
  ): Promise<Category[]> {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(req.user.id, id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.categoriesService.remove(req.user.id, id);
    return { message: 'Category deleted successfully' };
  }

  @Get('admin/test')
  test() {
    return { message: 'Categories module is working correctly' };
  }
}
