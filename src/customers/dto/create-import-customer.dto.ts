import { IntersectionType, OmitType } from '@nestjs/swagger';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { CreateCustomerDto } from './create-customer.dto';

export class CreateImportCustomerDto extends IntersectionType(
  OmitType(CreateCustomerDto, ['addresses'] as const),
  CreateAddressDto,
) {}
