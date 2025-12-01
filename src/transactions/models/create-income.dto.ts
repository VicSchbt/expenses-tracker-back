import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Recurrence } from '@prisma/client';

export class CreateIncomeDto {
  @ApiProperty({
    description: 'Income label',
    example: 'Salary',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Income date (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Income amount',
    example: 3000.50,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiPropertyOptional({
    description: 'Recurrence pattern',
    enum: Recurrence,
    example: Recurrence.MONTHLY,
  })
  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @ApiPropertyOptional({
    description: 'End date for recurrence (ISO 8601 format). If not provided, recurrence continues indefinitely.',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the income is paid',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the recurring income is automatically paid. If true, isPaid will be set to true automatically.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isAuto?: boolean;
}

