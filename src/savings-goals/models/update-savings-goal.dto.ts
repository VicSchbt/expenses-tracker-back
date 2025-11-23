import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSavingsGoalDto {
  @ApiPropertyOptional({
    description: 'Savings goal name',
    example: 'Vacation Fund',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Target amount to save',
    example: 5000.00,
  })
  @IsNumber()
  @IsOptional()
  targetAmount?: number;

  @ApiPropertyOptional({
    description: 'Due date (ISO 8601 format)',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

