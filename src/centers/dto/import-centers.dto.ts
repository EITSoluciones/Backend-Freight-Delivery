import { ArrayNotEmpty, IsArray } from 'class-validator';
import { CreateCenterDto } from './create-center.dto';

export class ImportCentersDto {
  @IsArray()
  @ArrayNotEmpty()
  centers!: CreateCenterDto[];
}
