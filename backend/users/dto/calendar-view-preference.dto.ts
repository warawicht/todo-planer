import { IsEnum, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CalendarViewPreferenceDto {
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  defaultView?: 'day' | 'week' | 'month';

  @IsOptional()
  @IsInt()
  firstDayOfWeek?: number; // 0 for Sunday, 1 for Monday, etc.

  @IsOptional()
  @IsBoolean()
  showWeekends?: boolean;

  @IsOptional()
  @IsEnum(['12h', '24h'])
  timeFormat?: '12h' | '24h';
}