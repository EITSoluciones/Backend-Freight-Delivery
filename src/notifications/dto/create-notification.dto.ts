import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { NotificationChannel } from '../enums/notification-channel.enum';

export class CreateNotificationDto {
  @ApiProperty({ example: 'DELIVERY_DRIVER_INVITATION' })
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]*$/)
  @MaxLength(100)
  code!: string;

  @ApiProperty({ example: 'Invitación a repartidor' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ enum: NotificationChannel, example: NotificationChannel.SMS })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty({ example: 'Hola {param0}, instala la app: {param1}' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'Mensaje de invitación para repartidores' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  is_global?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
