import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { CreateDeliveryDriverDto } from './create-delivery-driver.dto';

export class UpdateDeliveryDriverDto extends PartialType(CreateDeliveryDriverDto)  {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
 
