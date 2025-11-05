import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

class UpdateUserPayload extends OmitType(CreateUserDto, ['password'] as const) { }

export class UpdateUserDto extends PartialType(UpdateUserPayload) {

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
