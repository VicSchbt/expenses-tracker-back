import { ApiProperty } from '@nestjs/swagger';

export class MonthYear {
  @ApiProperty({
    description: 'Year of the month',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Month number (1-12)',
    example: 11,
  })
  month: number;
}

