import {
  OmitType,
  PartialType
} from '@nestjs/mapped-types';
import {
  CreateCustomerDto
} from './create-customer.dto';
import {
  IsArray,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAddressDto } from 'src/addresses/dto/update-address.dto';

class UpdateCustomerBaseDto extends PartialType(
  OmitType(CreateCustomerDto, ['addresses'] as const),
) {}

export class UpdateCustomerDto extends UpdateCustomerBaseDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  addresses?: UpdateAddressDto[];
}