import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Recurrence } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Expense label',
    example: 'Coffee',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Expense date (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 5.50,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiPropertyOptional({
    description:
      'Total number of occurrences in the recurring series (including the first one). Cannot be used together with recurrenceEndDate.',
    example: 12,
  })
  @IsNumber()
  @IsOptional()
  recurrenceCount?: number;

  @ApiPropertyOptional({
    description: 'Recurrence pattern for the expense',
    enum: Recurrence,
    example: Recurrence.MONTHLY,
  })
  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @ApiPropertyOptional({
    description:
      'End date for recurrence (ISO 8601 format). If not provided, recurrence continues indefinitely.',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Whether the expense is paid',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description:
      'Whether the recurring expense is automatically paid. If true, isPaid will be set to true automatically.',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isAuto?: boolean;
}

