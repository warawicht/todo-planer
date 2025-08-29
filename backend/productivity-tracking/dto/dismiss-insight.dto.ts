import { IsUUID } from 'class-validator';

export class DismissInsightDto {
  @IsUUID()
  userId: string;
}