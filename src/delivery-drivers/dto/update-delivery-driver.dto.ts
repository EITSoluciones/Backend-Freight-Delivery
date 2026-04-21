import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryDriverDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  document_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  license_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  license_expiration?: string;
}
