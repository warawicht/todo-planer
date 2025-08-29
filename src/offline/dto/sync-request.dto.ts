import { IsArray, IsNotEmpty, IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  version: number;

  @IsOptional()
  data: any;

  @IsNumber()
  timestamp: number;
}

export class SyncRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncItemDto)
  items: SyncItemDto[];
}