import { IsUUID, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class TimeReportDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsUUID()
  @IsOptional()
  projectId: string;

  @IsUUID()
  @IsOptional()
  taskId: string;

  @IsNumber()
  @IsOptional()
  billableRate: number;
}