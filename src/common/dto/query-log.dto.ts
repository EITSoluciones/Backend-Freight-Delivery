import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { LogAction } from '../../logs/enums/log-action.enum';

export class QueryLogDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'users' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ enum: LogAction })
  @IsOptional()
  @IsEnum(LogAction)
  action?: LogAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user_uuid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entity_uuid?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsString()
  end_date?: string;
}
