import { IsUUID, IsDateString, IsOptional } from 'class-validator';

export class GetInsightsDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  @IsOptional()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate: Date;
}