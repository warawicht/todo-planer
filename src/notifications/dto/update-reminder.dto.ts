import { IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class UpdateReminderDto {
  @IsOptional()
  @IsEnum(['at_time', '5_min', '1_hour', '1_day'])
  timeBefore?: 'at_time' | '5_min' | '1_hour' | '1_day';

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}