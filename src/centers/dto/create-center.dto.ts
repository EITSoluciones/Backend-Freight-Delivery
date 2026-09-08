import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCenterDto {
  @ApiProperty({ example: 'CEDIS-001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  code!: string;

  @ApiProperty({ example: 'Centro de Distribucion Norte' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Centro principal de operaciones' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: 19.427 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -99.1677 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Avenida Reforma' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  internal_number?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  external_number?: string;

  @ApiPropertyOptional({ example: 'Juarez' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Cuauhtemoc' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  district?: string;

  @ApiPropertyOptional({ example: 'Ciudad de Mexico' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({ example: 'Ciudad de Mexico' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  state?: string;

  @ApiPropertyOptional({ example: 'Mexico' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @ApiPropertyOptional({ example: '06600' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  postal_code?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
