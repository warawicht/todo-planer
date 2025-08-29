import { IsString, IsUUID, Length, IsOptional } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @Length(1, 2000)
  content: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}