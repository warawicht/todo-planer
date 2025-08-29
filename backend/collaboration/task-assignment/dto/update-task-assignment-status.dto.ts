import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateTaskAssignmentStatusDto {
  @IsIn(['accepted', 'rejected', 'completed'])
  @IsNotEmpty()
  status: 'accepted' | 'rejected' | 'completed';
}