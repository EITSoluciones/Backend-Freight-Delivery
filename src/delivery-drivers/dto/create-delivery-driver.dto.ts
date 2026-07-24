import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateDeliveryDriverDto {
  @ApiPropertyOptional({
    example: '0f4e8f7b-8f4f-469d-9fea-f64a0e7db7e9',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  user_uuid?: string | null;

  @ApiProperty({ example: '8123456789' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: '+52' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(8)
  country_code!: string;

  @ApiProperty({ example: 'internal' })
  @IsNotEmpty()
  @IsString()
  driver_type!: string;

  @ApiProperty({ example: 'ine' })
  @IsNotEmpty()
  @IsString()
  identity_document_type!: string;

  @ApiProperty({ example: 'ABCD123456EFG' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  identity_document_number!: string;

  @ApiProperty({ example: 'chofer' })
  @IsNotEmpty()
  @IsString()
  license_type!: string;

  @ApiProperty({ example: 'ABC123456789' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  license_number!: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsNotEmpty()
  @IsDateString()
  license_expiration!: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  is_active!: boolean;
}
