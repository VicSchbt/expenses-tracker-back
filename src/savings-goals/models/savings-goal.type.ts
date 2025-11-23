import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SavingsGoal {
  @ApiProperty({
    description: 'Savings goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this savings goal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Savings goal name',
    example: 'Vacation Fund',
  })
  name: string;

  @ApiProperty({
    description: 'Target amount to save',
    example: 5000.00,
  })
  targetAmount: number;

  @ApiProperty({
    description: 'Current amount saved',
    example: 1500.00,
  })
  currentAmount: number;

  @ApiPropertyOptional({
    description: 'Due date for the savings goal',
    example: '2024-12-31T00:00:00.000Z',
    nullable: true,
  })
  dueDate: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T00:00:00.000Z',
  })
  createdAt: Date;
}

