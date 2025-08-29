import { IsEnum, IsOptional } from 'class-validator';

export class DataExportDto {
  @IsEnum(['json', 'csv', 'pdf'])
  format: 'json' | 'csv' | 'pdf';

  @IsEnum(['all', 'tasks', 'projects', 'time-blocks'])
  dataType: 'all' | 'tasks' | 'projects' | 'time-blocks';
}

export class DataExportResponseDto {
  id: string;
  format: 'json' | 'csv' | 'pdf';
  dataType: 'all' | 'tasks' | 'projects' | 'time-blocks';
  fileName: string;
  exportedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}