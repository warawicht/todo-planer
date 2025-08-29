import { IsString, Length, IsISO8601, Matches, IsOptional, IsUUID } from 'class-validator';

export class CreateTimeBlockDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(0, 500)
  @IsOptional()
  description?: string;

  @IsISO8601()
  startTime: string;

  @IsISO8601()
  endTime: string;

  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color code' })
  @IsOptional()
  color?: string;

  @IsUUID()
  @IsOptional()
  taskId?: string;
}