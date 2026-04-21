import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsOptional, IsString } from 'class-validator';

export class SaveAppConfigFormDataDto {
  @ApiProperty({
    example:
      '[{"uuid":"550e8400-e29b-41d4-a716-446655440000","value":"Freight Delivery"}]',
    description: 'JSON serializado con las configuraciones del formulario',
  })
  @IsString()
  configs!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Archivo opcional para reemplazar logo',
  })
  @IsOptional()
  @Allow()
  logo?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Archivo opcional para reemplazar favicon',
  })
  @IsOptional()
  @Allow()
  favicon?: any;
}