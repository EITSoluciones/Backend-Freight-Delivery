import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  DELIVERY_VEHICLE_STATUS_CODES,
  DELIVERY_VEHICLE_TYPE_CODES,
} from 'src/delivery-drivers/constants/delivery-catalogs';

export class UpdateDeliveryVehicleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  delivery_driver_uuid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  plate_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(DELIVERY_VEHICLE_TYPE_CODES)
  vehicle_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(DELIVERY_VEHICLE_STATUS_CODES)
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
