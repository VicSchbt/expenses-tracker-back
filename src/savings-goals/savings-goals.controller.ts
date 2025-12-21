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
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './models/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './models/update-savings-goal.dto';
import { SavingsGoal } from './models/savings-goal.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Transaction } from '../transactions/models/types/transaction.type';
import { GetSavingsGoalTransactionsQueryDto } from './models/get-savings-goal-transactions-query.dto';

@ApiTags('savings-goals')
@Controller('savings-goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new savings goal' })
  @ApiResponse({
    status: 201,
    description: 'Savings goal successfully created',
    type: SavingsGoal,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: { user: { id: string; email: string } },
    @Body() createSavingsGoalDto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    return this.savingsGoalsService.create(req.user.id, createSavingsGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all savings goals for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of savings goals',
    type: [SavingsGoal],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Request() req: { user: { id: string; email: string } },
  ): Promise<SavingsGoal[]> {
    return this.savingsGoalsService.findAll(req.user.id);
  }

  @Get(':id/transactions')
  @ApiOperation({
    summary: 'Get all transactions for a savings goal',
    description:
      'Returns transactions for a savings goal. Optionally filter by month and/or year using query parameters.',
  })
  @ApiParam({ name: 'id', description: 'Savings goal ID' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for the savings goal',
    type: [Transaction],
  })
  @ApiResponse({ status: 404, description: 'Savings goal not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request (e.g., year provided without month)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Query() queryDto: GetSavingsGoalTransactionsQueryDto,
  ): Promise<Transaction[]> {
    return this.savingsGoalsService.getTransactions(req.user.id, id, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a savings goal by ID' })
  @ApiParam({ name: 'id', description: 'Savings goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Savings goal found',
    type: SavingsGoal,
  })
  @ApiResponse({ status: 404, description: 'Savings goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<SavingsGoal> {
    return this.savingsGoalsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a savings goal' })
  @ApiParam({ name: 'id', description: 'Savings goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Savings goal successfully updated',
    type: SavingsGoal,
  })
  @ApiResponse({ status: 404, description: 'Savings goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() updateSavingsGoalDto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    return this.savingsGoalsService.update(
      req.user.id,
      id,
      updateSavingsGoalDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a savings goal' })
  @ApiParam({ name: 'id', description: 'Savings goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Savings goal successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Savings goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.savingsGoalsService.remove(req.user.id, id);
    return { message: 'Savings goal deleted successfully' };
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Test savings goals module' })
  @ApiResponse({
    status: 200,
    description: 'Savings goals module is working correctly',
  })
  test() {
    return { message: 'Savings goals module is working correctly' };
  }
}
