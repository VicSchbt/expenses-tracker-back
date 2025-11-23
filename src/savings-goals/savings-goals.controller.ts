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
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './models/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './models/update-savings-goal.dto';
import { SavingsGoal } from './models/savings-goal.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('savings-goals')
@UseGuards(JwtAuthGuard)
export class SavingsGoalsController {
  constructor(
    private readonly savingsGoalsService: SavingsGoalsService,
  ) {}

  @Post()
  async create(
    @Request() req: { user: { id: string; email: string } },
    @Body() createSavingsGoalDto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    return this.savingsGoalsService.create(
      req.user.id,
      createSavingsGoalDto,
    );
  }

  @Get()
  async findAll(
    @Request() req: { user: { id: string; email: string } },
  ): Promise<SavingsGoal[]> {
    return this.savingsGoalsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<SavingsGoal> {
    return this.savingsGoalsService.findOne(req.user.id, id);
  }

  @Patch(':id')
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
  async remove(
    @Request() req: { user: { id: string; email: string } },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.savingsGoalsService.remove(req.user.id, id);
    return { message: 'Savings goal deleted successfully' };
  }

  @Get('admin/test')
  test() {
    return { message: 'Savings goals module is working correctly' };
  }
}

