import { IsString, Length } from 'class-validator';

export class UpdateTaskCommentDto {
  @IsString()
  @Length(1, 2000)
  content: string;
}