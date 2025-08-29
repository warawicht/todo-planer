import { IsString, IsUUID, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';

export class CreateGoalDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  targetValue: number;

  @IsNumber()
  currentValue: number;

  @IsEnum(['daily', 'weekly', 'monthly'])
  period: 'daily' | 'weekly' | 'monthly';

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsEnum(['tasks_completed', 'time_tracked', 'projects_completed'])
  metric: 'tasks_completed' | 'time_tracked' | 'projects_completed';
}