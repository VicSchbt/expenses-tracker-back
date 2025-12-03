import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Recurrence } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription label',
    example: 'Netflix',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Subscription date (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Subscription amount',
    example: 15.99,
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
    description:
      'Total number of occurrences in the recurring series (including the first one). Cannot be used together with recurrenceEndDate.',
    example: 12,
  })
  @IsNumber()
  @IsOptional()
  recurrenceCount?: number;

  @ApiPropertyOptional({
    description: 'End date for recurrence (ISO 8601 format). If not provided, recurrence continues indefinitely.',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the subscription is paid',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the recurring subscription is automatically paid. If true, isPaid will be set to true automatically.',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isAuto?: boolean;
}

