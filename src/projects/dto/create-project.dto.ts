import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(0, 1000)
  @IsOptional()
  description?: string;

  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color code' })
  @IsOptional()
  color?: string;
}