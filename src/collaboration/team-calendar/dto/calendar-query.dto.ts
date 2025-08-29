import { IsISO8601, IsOptional, IsUUID, IsInt, Min, Max, IsString } from 'class-validator';

export class CalendarQueryDto {
  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  endDate?: string;

  @IsUUID(undefined, { each: true })
  @IsOptional()
  userIds?: string[];

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @IsInt()
  @Min(0)
  @IsOptional()
  page?: number = 1;

  @IsString()
  @IsOptional()
  search?: string;
}