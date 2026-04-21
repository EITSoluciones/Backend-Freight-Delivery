import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class QueryDeliveryVehicleDto extends PaginationDto {
  @ApiPropertyOptional({ example: '0f4e8f7b-8f4f-469d-9fea-f64a0e7db7e9' })
  @IsOptional()
  @IsUUID()
  delivery_driver_uuid?: string;
}
