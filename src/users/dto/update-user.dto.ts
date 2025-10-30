import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

class UpdateUserPayload extends OmitType(CreateUserDto, ['password'] as const) {}

export class UpdateUserDto extends PartialType(UpdateUserPayload) {}
