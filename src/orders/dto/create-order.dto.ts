import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { OrderPriority } from '../enums/order-priority.enum';

export class CreateOrderDto {
  @ApiProperty({ example: 'PED-000001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  order_number!: string;

  @ApiProperty({ example: '2026-08-20T10:30:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  order_date!: string;

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

  @ApiProperty({ example: '44db3eef-5c9f-4c83-9d3f-3bf5f6fb7e81' })
  @IsNotEmpty()
  @IsUUID()
  origin_center_uuid!: string;

  @ApiPropertyOptional({ example: '2026-08-25T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  delivery_window_start?: string;

  @ApiPropertyOptional({ example: '2026-08-25T13:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  delivery_window_end?: string;

  @ApiProperty({ example: '2026-08-25T13:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  delivery_date!: string;

  @ApiPropertyOptional({ enum: OrderPriority, example: OrderPriority.MEDIUM })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @ApiProperty({ example: 'María López' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  recipient_name!: string;

  @ApiProperty({ example: 'maria.lopez@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  recipient_email!: string;

  @ApiProperty({ example: '5551234567' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  recipient_phone!: string;

  @ApiPropertyOptional({ example: '5559876543' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  recipient_secondary_phone?: string;

  @ApiPropertyOptional({ example: 19.427 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -99.1677 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Avenida Reforma' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  internal_number?: string;

  @ApiPropertyOptional({ example: '123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  external_number?: string;

  @ApiPropertyOptional({ example: 'Juárez' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Cuauhtémoc' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  district?: string;

  @ApiPropertyOptional({ example: 'Ciudad de México' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({ example: 'Ciudad de México' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  state?: string;

  @ApiPropertyOptional({ example: 'México' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @ApiPropertyOptional({ example: '06600' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  postal_code?: string;

  @ApiPropertyOptional({ example: 'Acceso por la puerta principal' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
