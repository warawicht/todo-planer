import { IsString, IsOptional, IsInt, IsISO8601, Length, Min, Max } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsString()
  @Length(0, 2000)
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsOptional()
  dueDate?: string;

  @IsInt()
  @Min(0)
  @Max(4)
  @IsOptional()
  priority?: number = 0;

  @IsInt()
  @IsOptional()
  position?: number;
}