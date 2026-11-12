import { Type } from 'class-transformer';
import { IsBooleanString, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsBooleanString()
  is_active?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
