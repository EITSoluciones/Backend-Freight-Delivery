import { IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { CreateCustomerDto } from './create-customer.dto';

export class CreateImportCustomerDto extends IntersectionType(
  PartialType(OmitType(CreateCustomerDto, ['addresses', 'code'] as const)),
  CreateAddressDto,
) {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;
}
