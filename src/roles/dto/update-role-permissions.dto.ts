import { IsOptional, IsString, MaxLength, IsBoolean, IsUUID } from 'class-validator';

export class UpdateRolePermissionsDto {

  @IsOptional()
  @IsUUID('4', { each: true })
  permissionUuids: string[];
  
}