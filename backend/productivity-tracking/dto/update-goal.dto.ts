import { IsUUID, IsNumber } from 'class-validator';

export class UpdateGoalDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  currentValue: number;
}