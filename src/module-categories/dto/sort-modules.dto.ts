import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class SortModulesDto {
  @IsUUID()
  module_category_uuid!: string;

  @ArrayNotEmpty({ message: 'La lista de módulos a ordenar no puede estar vacía.' })
  @IsArray()
  @IsUUID('4', { each: true })
  ordered_uuids!: string[];
}
