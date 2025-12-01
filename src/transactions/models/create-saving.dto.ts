import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSavingDto {
  @ApiProperty({
    description: 'Savings goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  goalId: string;

  @ApiProperty({
    description: 'Saving amount',
    example: 500.00,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Saving date (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description: 'Whether the saving is paid',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

