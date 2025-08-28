import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class TimezonePreferenceDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  autoDetect?: boolean;
}

export class TimezonePreferenceResponseDto {
  timezone: string;
  autoDetect: boolean;
  updatedAt: Date;
}