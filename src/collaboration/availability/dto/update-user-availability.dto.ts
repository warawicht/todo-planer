import { IsISO8601, IsIn, IsString, Length, IsOptional } from 'class-validator';

export class UpdateUserAvailabilityDto {
  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @IsISO8601()
  @IsOptional()
  endTime?: string;

  @IsIn(['available', 'busy', 'away', 'offline'])
  @IsOptional()
  status?: 'available' | 'busy' | 'away' | 'offline';

  @IsString()
  @Length(0, 500)
  @IsOptional()
  note?: string;
}