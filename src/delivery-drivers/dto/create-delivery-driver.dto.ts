import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
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

export class CreateDeliveryDriverDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({ example: 'default' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @IsIn(DELIVERY_DRIVER_PROFILE_CODES)
  profile: string;

  @ApiProperty({ example: '8123456789' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'internal' })
  @IsNotEmpty()
  @IsString()
  @IsIn(DELIVERY_DRIVER_TYPE_CODES)
  driver_type: string;

  @ApiProperty({ example: 'ine' })
  @IsNotEmpty()
  @IsString()
  @IsIn(DELIVERY_DOCUMENT_TYPE_CODES)
  document_type: string;

  @ApiProperty({ example: 'ABCD123456EFG' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  document_number: string;

  @ApiProperty({ example: 'chofer' })
  @IsNotEmpty()
  @IsString()
  @IsIn(DELIVERY_LICENSE_TYPE_CODES)
  license_type: string;

  @ApiProperty({ example: 'ABC123456789' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  license_number: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsNotEmpty()
  @IsDateString()
  license_expiration: string;

  @ApiProperty({ example: 'active' })
  @IsNotEmpty()
  @IsString()
  @IsIn(DELIVERY_DRIVER_STATUS_CODES)
  status: string;
}
