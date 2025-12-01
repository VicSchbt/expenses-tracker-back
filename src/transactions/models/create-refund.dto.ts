import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRefundDto {
  @ApiProperty({
    description: 'Refund label',
    example: 'Product Return',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Refund date (ISO 8601 format)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Refund amount',
    example: 50.00,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Whether the refund is paid',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

