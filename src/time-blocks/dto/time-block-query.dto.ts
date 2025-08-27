import { IsOptional, IsISO8601 } from 'class-validator';

export class TimeBlockQueryDto {
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;
}