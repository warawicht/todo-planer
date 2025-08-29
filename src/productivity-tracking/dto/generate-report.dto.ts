import { IsUUID, IsDateString, IsEnum } from 'class-validator';

export class GenerateReportDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  templateId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsEnum(['pdf', 'csv', 'excel'])
  format: 'pdf' | 'csv' | 'excel';
}