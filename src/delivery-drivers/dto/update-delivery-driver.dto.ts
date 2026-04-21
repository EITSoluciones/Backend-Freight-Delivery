import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  DELIVERY_DOCUMENT_TYPE_CODES,
  DELIVERY_DRIVER_PROFILE_CODES,
  DELIVERY_DRIVER_STATUS_CODES,
  DELIVERY_DRIVER_TYPE_CODES,
  DELIVERY_LICENSE_TYPE_CODES,
} from '../constants/delivery-catalogs';

export class UpdateDeliveryDriverDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsIn(DELIVERY_DRIVER_PROFILE_CODES)
  profile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(DELIVERY_DRIVER_TYPE_CODES)
  driver_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(DELIVERY_DOCUMENT_TYPE_CODES)
  document_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  document_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(DELIVERY_LICENSE_TYPE_CODES)
  license_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  license_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  license_expiration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(DELIVERY_DRIVER_STATUS_CODES)
  status?: string;
}
