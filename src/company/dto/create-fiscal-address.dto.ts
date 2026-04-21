import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFiscalAddressDto {
  @ApiProperty({ example: 'Empresa ABC S.A. de C.V.' })
  @IsString()
  @MaxLength(255)
  business_name: string;

  @ApiProperty({ example: 'XAXX010101000' })
  @IsString()
  @MinLength(12)
  @MaxLength(20)
  rfc: string;

  @ApiProperty({ example: 'Av. Principal' })
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  external_number?: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  internal_number?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @MaxLength(255)
  colony: string;

  @ApiProperty({ example: 'Ciudad de Mexico' })
  @IsString()
  @MaxLength(255)
  city: string;

  @ApiProperty({ example: 'CDMX' })
  @IsString()
  @MaxLength(255)
  state: string;

  @ApiProperty({ example: '06600' })
  @IsString()
  @MaxLength(10)
  zip_code: string;

  @ApiPropertyOptional({ example: 'Mexico' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}
