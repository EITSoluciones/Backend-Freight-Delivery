import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { log } from 'node:console';
import { Observable } from 'rxjs';
import { META_PERMISSIONS } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //Obtener Permisos definidos en el decorador
    const validPermissions: string[] = this.reflector.get(
      META_PERMISSIONS,
      context.getHandler(),
    );

    // Si no se especifican Permisos, no se aplica validación
    if (!validPermissions || validPermissions.length === 0) {
      return true;
    }

    //Obtener usuario desde la request
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    console.log('UserRoleGuard - user:', user);
    console.log('UserRoleGuard - user.roles:', user?.roles);

    //Usuario no encontrado en la request
    if (!user) throw new BadRequestException('Usuario no encontrado!');

    //Obtiene Pemisos definidos en el Rol
    const userPermissionCodes = user.roles.flatMap((role) =>
      (role.permissions ?? []).map((p) => p.code),
    );

    console.log('UserRoleGuard - validPermissions:', validPermissions);
    console.log('UserRoleGuard - userPermissionCodes:', userPermissionCodes);

    //Validar Permiso del Rol
    const hasValidRole = validPermissions.some((code) =>
      userPermissionCodes.includes(code),
    );

    if (!hasValidRole)
      throw new ForbiddenException(
        `El usuario no cuenta con los permisos [${validPermissions}] necesarios para acceder a este recurso`,
      );

    return true;
  }
}
