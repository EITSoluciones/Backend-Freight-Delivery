import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  external_number?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  internal_number?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  neighborhood!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  district!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  state!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  country!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  postal_code!: string;

  @IsString()
  @IsOptional()
  reference!: string;

  @IsNumber()
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;
}
