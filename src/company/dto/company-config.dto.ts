import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

export class CreateCompanyConfigDto {
  @ApiProperty({ example: 'theme_color' })
  @IsString()
  @MaxLength(100)
  key!: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Color principal del tema' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCompanyConfigDto extends PartialType(
  OmitType(CreateCompanyConfigDto, ['key'] as const),
) {}
