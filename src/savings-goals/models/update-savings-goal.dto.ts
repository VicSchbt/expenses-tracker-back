import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateSavingsGoalDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  targetAmount?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

