import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {

  @ApiProperty({ example: true, description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ example: 'Operación exitosa', description: 'Mensaje descriptivo de la operación' })
  message: string;

  @ApiProperty({ description: 'Datos de la respuesta' })
  data: TemplateStringsArray;

  constructor(success: boolean, message: string, data: TemplateStringsArray) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

}
