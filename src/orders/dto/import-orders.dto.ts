import { ArrayNotEmpty, IsArray } from 'class-validator';
import { CreateImportOrderDto } from './create-import-order.dto';

export class ImportOrdersDto {
  @IsArray()
  @ArrayNotEmpty()
  orders!: CreateImportOrderDto[];
}
