import { IsUUID, IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class ExportTimeReportDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsEnum(['pdf', 'csv', 'excel'])
  format: 'pdf' | 'csv' | 'excel';

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