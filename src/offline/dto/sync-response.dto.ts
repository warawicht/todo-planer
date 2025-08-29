import { IsArray, IsNotEmpty, IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConflictDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  localVersion: number;

  @IsNumber()
  serverVersion: number;

  @IsOptional()
  localData: any;

  @IsOptional()
  serverData: any;
}

export class SyncResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncItemDto)
  updatedItems: SyncItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConflictDto)
  conflicts: ConflictDto[];

  @IsNumber()
  timestamp: number;
}

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