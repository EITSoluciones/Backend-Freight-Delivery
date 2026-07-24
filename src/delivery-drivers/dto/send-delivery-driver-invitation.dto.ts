import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsUUID } from 'class-validator';

export class SendDeliveryDriverInvitationDto {
  @ApiProperty({ example: '0f4e8f7b-8f4f-469d-9fea-f64a0e7db7e9' })
  @IsUUID()
  user_uuid!: string;
}
