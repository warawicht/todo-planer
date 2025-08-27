import { IsString, IsOptional, IsInt, IsUUID, IsISO8601, IsArray, Length, Min, Max, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsIn(['pending', 'in-progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsISO8601()
  @IsOptional()
  completedAt?: string;
}