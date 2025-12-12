import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateRoleDto {

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}