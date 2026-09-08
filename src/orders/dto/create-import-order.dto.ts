import { OmitType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class CreateImportOrderDto extends OmitType(CreateOrderDto, [
  'customer_uuid',
  'origin_center_uuid',
] as const) {
  @ApiProperty({ example: 'CLI-001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  customer_code!: string;

  @ApiProperty({ example: 'CEDIS-001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  origin_center_code!: string;
}
