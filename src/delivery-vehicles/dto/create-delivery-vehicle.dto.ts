import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
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

export class CreateDeliveryVehicleDto {
  @ApiProperty({ example: '0f4e8f7b-8f4f-469d-9fea-f64a0e7db7e9' })
  @IsNotEmpty()
  @IsUUID()
  delivery_driver_uuid: string;

  @ApiProperty({ example: 'Unidad Norte 01' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Nissan' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  brand: string;

  @ApiProperty({ example: 'March' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  model: string;

  @ApiProperty({ example: 'ABC1234' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  plate_number: string;

  @ApiProperty({ example: 'car' })
  @IsNotEmpty()
  @IsString()
  @IsIn(DELIVERY_VEHICLE_TYPE_CODES)
  vehicle_type: string;

  @ApiPropertyOptional({ example: 'Blanco' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  @IsIn(DELIVERY_VEHICLE_STATUS_CODES)
  status?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @ApiPropertyOptional({ example: 'Vehiculo asignado a reparto urbano.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
