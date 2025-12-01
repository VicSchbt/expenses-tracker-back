import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, Recurrence } from '@prisma/client';

export class Transaction {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Transaction label',
    example: 'Salary',
  })
  label: string;

  @ApiProperty({
    description: 'Transaction date',
    example: '2024-01-15T00:00:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Transaction amount',
    example: 3000.50,
  })
  value: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.INCOME,
  })
  type: TransactionType;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  categoryId: string | null;

  @ApiPropertyOptional({
    description: 'Savings goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  goalId: string | null;

  @ApiPropertyOptional({
    description: 'Recurrence pattern',
    enum: Recurrence,
    nullable: true,
  })
  recurrence: Recurrence | null;

  @ApiPropertyOptional({
    description: 'End date for recurrence',
    example: '2024-12-31T00:00:00.000Z',
    nullable: true,
  })
  recurrenceEndDate: Date | null;

  @ApiPropertyOptional({
    description: 'Parent transaction ID for recurring transaction instances',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  parentTransactionId: string | null;

  @ApiPropertyOptional({
    description: 'Whether the transaction is paid',
    example: true,
    nullable: true,
  })
  isPaid: boolean | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T00:00:00.000Z',
  })
  updatedAt: Date;
}

