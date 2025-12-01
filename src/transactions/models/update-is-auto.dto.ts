import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating the isAuto field of a recurring transaction.
 * When isAuto is true, isPaid will be automatically set to true.
 * When isAuto is false, isPaid will be automatically set to false.
 */
export class UpdateIsAutoDto {
  @ApiProperty({
    description: 'Whether the recurring transaction is automatically paid',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isAuto: boolean;
}

