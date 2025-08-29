import { IsString, IsUUID, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateReportTemplateDto {
  @IsUUID()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsObject()
  configuration: any;

  @IsBoolean()
  isActive: boolean;
}