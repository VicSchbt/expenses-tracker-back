import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Category {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Category label',
    example: 'Groceries',
  })
  label: string;

  @ApiPropertyOptional({
    description: 'Category icon',
    example: 'shopping-cart',
    nullable: true,
  })
  icon?: string | null;

  @ApiPropertyOptional({
    description: 'Category color',
    example: '#FF5733',
    nullable: true,
  })
  color?: string | null;
}

