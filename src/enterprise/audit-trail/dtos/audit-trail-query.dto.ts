import { IsOptional, IsString, IsISO8601 } from 'class-validator';

export class AuditTrailQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  limit?: number = 50;

  @IsOptional()
  offset?: number = 0;
}