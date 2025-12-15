import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category label',
    example: 'Groceries',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({
    description: 'Category icon',
    example: 'shopping-cart',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Category color',
    example: '#FF5733',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Budget amount for this category',
    example: 500.0,
  })
  @IsNumber()
  @IsOptional()
  budget?: number;
}
