import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';

export enum CalendarViewType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class CalendarViewQueryDto {
  @IsEnum(CalendarViewType)
  view: CalendarViewType;

  @IsISO8601()
  date: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}