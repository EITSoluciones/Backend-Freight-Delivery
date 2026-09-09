import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { CreateImportCustomerDto } from './create-import-customer.dto';

export class ImportCustomersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateImportCustomerDto)
  customers!: CreateImportCustomerDto[];
}
