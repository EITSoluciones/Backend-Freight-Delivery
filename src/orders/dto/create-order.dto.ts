import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'PED-000001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  order_number!: string;

  @ApiProperty({ example: '0f4e8f7b-8f4f-469d-9fea-f64a0e7db7e9' })
  @IsNotEmpty()
  @IsUUID()
  customer_uuid!: string;

  @ApiPropertyOptional({ example: 'Entregar por acceso principal' })
  @IsOptional()
  @IsString()
  additional_notes?: string;

  @ApiPropertyOptional({ example: 1250.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 1.25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ example: 350.75 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: '44db3eef-5c9f-4c83-9d3f-3bf5f6fb7e81' })
  @IsOptional()
  @IsUUID()
  origin_center_uuid?: string;

  @ApiPropertyOptional({ example: '2026-08-25T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  delivery_window_start?: string;

  @ApiPropertyOptional({ example: '2026-08-25T13:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  delivery_window_end?: string;

  @ApiPropertyOptional({ example: '2026-08-25T13:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  delivery_date?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
