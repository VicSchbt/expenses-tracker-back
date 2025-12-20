import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecurrenceScope } from '../../enums/recurrence-scope.enum';

/**
 * DTO for delete transaction query parameters.
 * Used to specify the scope when deleting recurring transactions.
 */
export class DeleteTransactionQueryDto {
  @ApiPropertyOptional({
    description:
      'Scope for deleting recurring transactions. Only applies if the transaction is part of a recurring series.',
    enum: RecurrenceScope,
    example: RecurrenceScope.CURRENT_ONLY,
    default: RecurrenceScope.CURRENT_ONLY,
  })
  @IsEnum(RecurrenceScope)
  @IsOptional()
  recurrenceScope?: RecurrenceScope;
}
