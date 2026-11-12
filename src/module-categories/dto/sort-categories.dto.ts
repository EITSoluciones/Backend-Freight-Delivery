
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsUUID,
} from 'class-validator';

export class SortModuleCategoriesDto {
  @ApiProperty({
    description: 'UUIDs de las categorías en el orden deseado',
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ordered_uuids!: string[];
}
