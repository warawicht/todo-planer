import { IsInt, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateStatisticDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  date: Date;

  @IsInt()
  tasksCompleted: number;

  @IsInt()
  tasksCreated: number;

  @IsInt()
  overdueTasks: number;

  @IsNumber()
  completionRate: number;

  @IsInt()
  totalTimeTracked: number; // in seconds

  @IsNumber()
  averageCompletionTime: number; // in hours
}