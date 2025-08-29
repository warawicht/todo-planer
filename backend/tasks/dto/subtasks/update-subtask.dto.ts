import { IsString, IsOptional, IsInt, IsISO8601, Length, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubtaskDto } from './create-subtask.dto';

export class UpdateSubtaskDto extends PartialType(CreateSubtaskDto) {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  completedAt?: string;

  @IsInt()
  @IsOptional()
  position?: number;
}