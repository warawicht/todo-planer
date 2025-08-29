import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProfilePreferenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
}

export class ProfilePreferenceResponseDto {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  updatedAt: Date;
}