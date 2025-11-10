import {
  PartialType
} from '@nestjs/mapped-types';
import {
  CreateClientDto
} from './create-client.dto';
import {
  IsArray
} from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsArray()
  addresses: never;
}