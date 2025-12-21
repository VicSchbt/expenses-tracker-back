import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class GetSavingsGoalTransactionsQueryDto {
  @ApiPropertyOptional({
    description: 'Year for filtering transactions (e.g., 2024)',
    example: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    description:
      'Month for filtering transactions (1-12). If year is provided, month is required. If only month is provided, uses current year. If both are omitted, returns all transactions.',
    example: 11,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
