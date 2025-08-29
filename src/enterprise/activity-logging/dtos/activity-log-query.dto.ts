import { IsOptional, IsString, IsISO8601 } from 'class-validator';

export class ActivityLogQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  limit?: number = 50;

  @IsOptional()
  offset?: number = 0;
}