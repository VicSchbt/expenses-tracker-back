import { IsNotEmpty, IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateSavingDto {
  @IsString()
  @IsNotEmpty()
  goalId: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}

