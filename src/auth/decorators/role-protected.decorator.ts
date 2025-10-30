import { SetMetadata } from '@nestjs/common';
import { Permissions, ValidRoles } from '../interfaces';

export const META_PERMISSIONS = 'permissions';

export const RoleProtected = (...args: Permissions[]) => {
    return SetMetadata(META_PERMISSIONS, args)
};
