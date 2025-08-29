import { IsUUID, IsDateString, IsEnum, IsObject, IsOptional } from 'class-validator';

export class ExportDataDto {
  @IsUUID()
  userId: string;

  @IsEnum(['pdf', 'csv', 'excel'])
  format: 'pdf' | 'csv' | 'excel';

  @IsEnum(['time_entries', 'tasks', 'summary'])
  dataType: 'time_entries' | 'tasks' | 'summary';

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsObject()
  @IsOptional()
  filters: any;
}