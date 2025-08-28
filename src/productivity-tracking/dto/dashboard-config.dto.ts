import { IsInt, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class DashboardConfigDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  userId: string;

  widgetType: string;

  @IsInt()
  position: number;

  config: any; // JSON configuration for the widget

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}