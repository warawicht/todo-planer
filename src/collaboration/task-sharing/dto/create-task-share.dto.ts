import { IsUUID, IsIn, IsNotEmpty } from 'class-validator';

export class CreateTaskShareDto {
  @IsUUID()
  @IsNotEmpty()
  sharedWithId: string;

  @IsIn(['view', 'edit', 'manage'])
  permissionLevel: 'view' | 'edit' | 'manage';
}