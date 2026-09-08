import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { CreateCenterDto } from './create-center.dto';

export class ImportCentersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCenterDto)
  centers!: CreateCenterDto[];
}
