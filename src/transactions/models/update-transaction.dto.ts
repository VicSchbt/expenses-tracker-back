import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Recurrence } from '@prisma/client';

/**
 * DTO for updating an existing transaction.
 * All fields are optional; only provided fields will be updated.
 */
export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description: 'Transaction label',
    example: 'Updated transaction label',
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({
    description: 'Transaction date (ISO 8601 format)',
    example: '2024-01-20',
  })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    description: 'Transaction amount',
    example: 120.75,
  })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({
    description: 'Category ID associated with the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Recurrence pattern for the transaction',
    enum: Recurrence,
  })
  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @ApiPropertyOptional({
    description: 'Whether the transaction is paid',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Due date for the transaction (ISO 8601 format)',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}


