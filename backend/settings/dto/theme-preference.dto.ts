import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';

export class ThemePreferenceDto {
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @IsBoolean()
  highContrastMode?: boolean;
}

export class ThemePreferenceResponseDto {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  highContrastMode: boolean;
  updatedAt: Date;
}