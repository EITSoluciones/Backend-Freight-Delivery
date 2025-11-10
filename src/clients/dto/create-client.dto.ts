import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import {
  Type
} from 'class-transformer';
import {
  CreateAddressDto
} from 'src/addresses/dto/create-address.dto';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(25)
  phone ? : string;

  @IsArray()
  @ValidateNested({
    each: true
  })
  @Type(() => CreateAddressDto)
  addresses: CreateAddressDto[];
}