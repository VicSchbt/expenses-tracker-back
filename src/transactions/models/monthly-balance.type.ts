import { ApiProperty } from '@nestjs/swagger';

export class MonthlyBalance {
  @ApiProperty({
    description: 'Year of the balance calculation',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Month of the balance calculation (1-12)',
    example: 11,
  })
  month: number;

  @ApiProperty({
    description: 'Total income for the month',
    example: 3000.0,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Total bills planned for the month',
    example: 500.0,
  })
  totalBills: number;

  @ApiProperty({
    description: 'Total savings planned for the month',
    example: 200.0,
  })
  totalSavings: number;

  @ApiProperty({
    description: 'Total subscriptions planned for the month',
    example: 100.0,
  })
  totalSubscriptions: number;

  @ApiProperty({
    description: 'Total expenses occurred in the month',
    example: 150.0,
  })
  totalExpenses: number;

  @ApiProperty({
    description: 'Total refunds occurred in the month',
    example: 50.0,
  })
  totalRefunds: number;

  @ApiProperty({
    description: 'Current balance for the month',
    example: 2100.0,
  })
  balance: number;
}

