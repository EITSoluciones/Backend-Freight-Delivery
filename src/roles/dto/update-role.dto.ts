import { OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, ['code'] as const),
) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
