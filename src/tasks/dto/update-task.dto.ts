import { IsString, IsOptional, IsInt, IsUUID, IsISO8601, IsArray, Length, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}