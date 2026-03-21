import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeliveryDriverDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({ example: '8123456789' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'ABCD123456EFG' })
  @IsNotEmpty()
  @IsString()
  document_number: string;

  @ApiProperty({ example: 'ABC123456789' })
  @IsNotEmpty()
  @IsString()
  license_number: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsNotEmpty()
  @IsDateString()
  license_expiration: string;
}
