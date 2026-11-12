import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class ModulesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'UUID de categoría para filtrar módulos' })
  @IsOptional()
  @IsUUID()
  module_category_uuid?: string;
}
