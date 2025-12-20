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
import { RecurrenceScope } from '../../enums/recurrence-scope.enum';

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
    description: 'End date for recurrence (ISO 8601 format)',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description:
      'Total number of occurrences in the recurring series (including the first one). Cannot be used together with recurrenceEndDate.',
    example: 12,
  })
  @IsNumber()
  @IsOptional()
  recurrenceCount?: number;

  @ApiPropertyOptional({
    description:
      'Scope for updating recurring transactions. Only applies if the transaction is part of a recurring series.',
    enum: RecurrenceScope,
    example: RecurrenceScope.CURRENT_ONLY,
    default: RecurrenceScope.CURRENT_ONLY,
  })
  @IsEnum(RecurrenceScope)
  @IsOptional()
  recurrenceScope?: RecurrenceScope;
}
