import { IsUUID, IsEnum, IsBoolean } from 'class-validator';

export class CreateReminderDto {
  @IsUUID()
  taskId: string;

  @IsEnum(['at_time', '5_min', '1_hour', '1_day'])
  timeBefore: 'at_time' | '5_min' | '1_hour' | '1_day';

  @IsBoolean()
  enabled: boolean;
}