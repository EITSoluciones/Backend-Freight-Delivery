import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDeliveryDriverDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  user_uuid!: string;


  @ApiProperty({ example: '8123456789' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'internal' })
  @IsNotEmpty()
  @IsString()
  driver_type?: string;

  @ApiProperty({ example: 'ine' })
  @IsNotEmpty()
  @IsString()
  document_type?: string;

  @ApiProperty({ example: 'ABCD123456EFG' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  document_number?: string;

  @ApiProperty({ example: 'chofer' })
  @IsNotEmpty()
  @IsString()
  license_type?: string;

  @ApiProperty({ example: 'ABC123456789' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  license_number?: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsNotEmpty()
  @IsDateString()
  license_expiration?: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsString()
   is_active?: boolean;
  }
