import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class TrendFilterDto {
  @IsIn(['daily', 'weekly', 'monthly'])
  @IsOptional()
  period?: 'daily' | 'weekly' | 'monthly';

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}