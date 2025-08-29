import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class ApprovalActionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['approved', 'rejected'])
  action: 'approved' | 'rejected';

  @IsString()
  @IsOptional()
  comments?: string;
}