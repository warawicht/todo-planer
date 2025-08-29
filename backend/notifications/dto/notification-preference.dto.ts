import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class NotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format. Use HH:MM' })
  quietHoursStart?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format. Use HH:MM' })
  quietHoursEnd?: string;

  @IsOptional()
  @IsBoolean()
  taskRemindersEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  timeBlockAlertsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  deadlineWarningsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  productivitySummariesEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  systemAlertsEnabled?: boolean;
}