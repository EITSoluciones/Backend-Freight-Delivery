import { IsArray, IsUUID } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permission_uuids!: string[];
}
