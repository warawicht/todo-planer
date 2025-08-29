import { IsString, IsEnum, IsInt, Min, Max, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(['task_reminder', 'time_block_alert', 'deadline_warning', 'productivity_summary', 'system_alert'])
  type: 'task_reminder' | 'time_block_alert' | 'deadline_warning' | 'productivity_summary' | 'system_alert';

  @IsEnum(['email', 'push', 'in_app'])
  channel: 'email' | 'push' | 'in_app';

  @IsInt()
  @Min(0)
  @Max(4)
  priority: number;

  @IsUUID()
  relatedEntityId: string;

  @IsEnum(['task', 'time_block', 'project'])
  relatedEntityType: 'task' | 'time_block' | 'project';
}