import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateTaskAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  assignedToId: string;
}