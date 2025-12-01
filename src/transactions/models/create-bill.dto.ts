import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Recurrence } from '@prisma/client';

export class CreateBillDto {
  @ApiProperty({
    description: 'Bill label',
    example: 'Electricity Bill',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Bill date (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Bill amount',
    example: 150.00,
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
    description: 'Whether the bill is paid',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the recurring bill is automatically paid. If true, isPaid will be set to true automatically.',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isAuto?: boolean;
}

