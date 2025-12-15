import { IsOptional, IsString, IsNumber, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category label',
    example: 'Groceries',
  })
  @IsString()
  @IsOptional()
  label?: string;

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
    description:
      'Budget amount for this category. Set to null to clear the budget.',
    example: 500.0,
    nullable: true,
  })
  @ValidateIf((o) => o.budget !== null && o.budget !== undefined)
  @IsNumber()
  @IsOptional()
  budget?: number | null;
}
