import { IsString, IsOptional, IsArray, IsBoolean, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WorkflowStepDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  order: number;

  @IsArray()
  @IsString({ each: true })
  approvers: string[]; // Role IDs or User IDs

  @IsNumber()
  requiredApprovals: number;
}

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}