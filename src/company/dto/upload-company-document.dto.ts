import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../../documents/enums/document-type.enum';

export class UploadCompanyDocumentDto {
  @ApiProperty({ enum: DocumentType, description: 'Tipo de documento' })
  @IsEnum(DocumentType)
  document_type: DocumentType;

  @ApiPropertyOptional({ description: 'Si es el documento por defecto' })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ description: 'Descripción del documento' })
  @IsOptional()
  @IsString()
  description?: string;
}
