import { IsNotEmpty, IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

