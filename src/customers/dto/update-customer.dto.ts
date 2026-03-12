import {
  PartialType
} from '@nestjs/mapped-types';
import {
  CreateCustomerDto
} from './create-customer.dto';
import {
  IsArray
} from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsArray()
  addresses: never;
}