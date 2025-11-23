import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSavingsGoalDto {
  @ApiProperty({
    description: 'Savings goal name',
    example: 'Vacation Fund',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Target amount to save',
    example: 5000.00,
  })
  @IsNumber()
  @IsNotEmpty()
  targetAmount: number;

  @ApiPropertyOptional({
    description: 'Due date (ISO 8601 format)',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

