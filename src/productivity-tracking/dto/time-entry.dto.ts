import { IsBoolean, IsInt, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class TimeEntryDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  taskId?: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @IsInt()
  @IsOptional()
  duration?: number; // in seconds

  @IsBoolean()
  isManual: boolean;

  @IsOptional()
  description?: string;
}