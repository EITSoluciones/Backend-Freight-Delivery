import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { CreateImportOrderDto } from './create-import-order.dto';

export class ImportOrdersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateImportOrderDto)
  orders!: CreateImportOrderDto[];
}
