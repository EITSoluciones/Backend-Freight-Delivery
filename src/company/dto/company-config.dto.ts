import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyConfigDto {
  @ApiProperty({ example: 'theme_color' })
  @IsString()
  @MaxLength(100)
  key: string;

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

export class UpdateCompanyConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;
}
