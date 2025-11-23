import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';
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
}

