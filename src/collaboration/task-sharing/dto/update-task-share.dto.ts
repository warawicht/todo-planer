import { IsIn } from 'class-validator';

export class UpdateTaskShareDto {
  @IsIn(['view', 'edit', 'manage'])
  permissionLevel: 'view' | 'edit' | 'manage';
}