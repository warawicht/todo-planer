import { IsISO8601, IsIn, IsString, Length, IsOptional } from 'class-validator';

export class CreateUserAvailabilityDto {
  @IsISO8601()
  startTime: string;

  @IsISO8601()
  endTime: string;

  @IsIn(['available', 'busy', 'away', 'offline'])
  status: 'available' | 'busy' | 'away' | 'offline';

  @IsString()
  @Length(0, 500)
  @IsOptional()
  note?: string;
}