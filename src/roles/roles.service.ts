import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  SuccessResponseDto,
  PaginatedResponse,
} from 'src/common/dto/success-response.dto';
import { Permission } from './entities/permission.entity';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { LogsService } from 'src/logs/logs.service';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesRepository } from './repositories/roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly dbErrorHandler: DBErrorHandlerService,
    private readonly logsService: LogsService,
  ) {}

  /** Obtener Catálogo de Roles */
  async getRolesCatalog(): Promise<SuccessResponseDto<Role[]>> {
    const roles = await this.rolesRepository.findActiveRoles();
    return new SuccessResponseDto(true, 'Roles obtenidos exitosamente!', roles);
  }

  /** Obtener Catálogo de Permisos */
  async getPermissionsCatalog(): Promise<SuccessResponseDto<Permission[]>> {
    const permissions = await this.rolesRepository.findActivePermissions();

    return new SuccessResponseDto(
      true,
      'Permisos obtenidos exitosamente!',
      permissions,
    );
  }

  /** Crear Rol */
  async create(
    createRoleDto: CreateRoleDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Role>> {
    try {
      const roleCategory = this.rolesRepository.createRole(createRoleDto);
      const savedRole = await this.rolesRepository.saveRole(roleCategory);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ROLES,
        action: LogAction.CREATE,
        entityUuid: savedRole.uuid,
        entityName: savedRole.name,
        description: `Rol creado: ${savedRole.name}`,
        newData: { name: savedRole.name, code: savedRole.code },
      });

      return new SuccessResponseDto(
        true,
        'Rol Creado Exitosamente!',
        savedRole,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  /** Obtener Roles */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Role>> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    const [Roles, total] = await this.rolesRepository.findRoles(paginationDto);

    return PaginatedResponse.create(
      Roles,
      total,
      page,
      limit,
      'Roles obtenidos exitosamente!',
    );
  }

  /** Obtener Rol */
  async findOne(uuid: string): Promise<SuccessResponseDto<Role>> {
    const role = await this.rolesRepository.findRoleByUuid(uuid);

    if (!role) {
      throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);
    }

    return new SuccessResponseDto(true, 'Rol obtenido exitosamente!', role);
  }

  /** Actualizar Rol */
  async update(
    uuid: string,
    updateRoleDto: UpdateRoleDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Role>> {
    const roleToUpdate = await this.rolesRepository.findRoleByUuid(uuid);

    if (!roleToUpdate)
      throw new NotFoundException(`Rol con uuid: ${uuid} no encontrada`);

    try {
      const oldData = { ...roleToUpdate };
      Object.assign(roleToUpdate, updateRoleDto);
      const updatedRole = await this.rolesRepository.saveRole(roleToUpdate);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ROLES,
        action: LogAction.UPDATE,
        entityUuid: updatedRole.uuid,
        entityName: updatedRole.name,
        description: `Rol actualizado: ${updatedRole.name}`,
        oldData,
        newData: updateRoleDto,
      });

      return new SuccessResponseDto(
        true,
        'Rol actualizado exitosamente!',
        updatedRole,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  /** Eliminar Role */
  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Role>> {
    const role = await this.rolesRepository.findRoleByUuid(uuid);

    if (!role)
      throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);

    await this.rolesRepository.softDeleteRoleByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.ROLES,
      action: LogAction.DELETE,
      entityUuid: role.uuid,
      entityName: role.name,
      description: `Rol eliminado: ${role.name}`,
      oldData: { name: role.name, code: role.code },
    });

    return new SuccessResponseDto(true, 'Rol eliminado exitosamente!', role);
  }

  /** Obtener Módulos autorizados de Roles */
  async getAuthorizedModulesByRole(
    userRoles: Role[],
  ): Promise<SuccessResponseDto<any[]>> {
    const categoryMap = new Map<string, any>();

    userRoles.forEach((role) => {
      role.permissions.forEach((permission) => {
        const module = permission.module;
        if (
          !permission.code.endsWith(':view') ||
          !module ||
          !module.is_active
        ) {
          return;
        }

        const category = module.module_category;
        const categoryKey = category.uuid;

        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, {
            group: category.name || 'General',
            active: category.is_active,
            items: new Map<string, any>(),
          });
        }

        const categoryEntry = categoryMap.get(categoryKey);

        if (!categoryEntry.items.has(module.uuid)) {
          categoryEntry.items.set(module.uuid, {
            icon: module.icon,
            name: module.name,
            route: module.url,
            active: module.is_active,
          });
        }
      });
    });

    const authModules = Array.from(categoryMap.values()).map((category) => ({
      group: category.group,
      active: category.active,
      items: Array.from(category.items.values()),
    }));

    return new SuccessResponseDto(
      true,
      'Módulos Autorizados obtenidos exitosamente!',
      authModules,
    );
  }

  /** Obtener Permisos por Rol */
  async getPermissionsByRole(
    uuid: string,
  ): Promise<SuccessResponseDto<Permission[]>> {
    const role = await this.rolesRepository.findRoleByUuidWithPermissions(uuid);

    if (!role) {
      throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);
    }

    return new SuccessResponseDto(
      true,
      'Permisos obtenidos exitosamente!',
      role.permissions,
    );
  }

  /** Actualizar Permisos del Rol */
  async updatePermissionsByRole(
    uuid: string,
    updateRolePermissionsDto: UpdateRolePermissionsDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Permission[]>> {
    const role = await this.rolesRepository.findRoleByUuidWithPermissions(uuid);

    if (!role)
      throw new NotFoundException(`Rol con uuid: ${uuid} no encontrada`);

    try {
      const oldPermissions = role.permissions.map((p) => p.uuid);

      const permissions =
        await this.rolesRepository.findActivePermissionsByUuids(
          updateRolePermissionsDto.permission_uuids,
        );

      if (
        permissions.length !==
        new Set(updateRolePermissionsDto.permission_uuids).size
      ) {
        throw new BadRequestException(
          'Uno o más permisos no existen o están inactivos',
        );
      }

      role.permissions = permissions;

      await this.rolesRepository.saveRole(role);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ROLES,
        action: LogAction.UPDATE,
        entityUuid: role.uuid,
        entityName: role.name,
        description: `Permisos actualizados para rol: ${role.name}`,
        oldData: { permissions: oldPermissions },
        newData: { permissions: updateRolePermissionsDto.permission_uuids },
      });

      return new SuccessResponseDto(
        true,
        `El Rol con uuid ${uuid} se ha actualizado exitosamente!`,
        role.permissions,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async UsersByRole(uuid: string): Promise<SuccessResponseDto<User[]>> {
    const role = await this.rolesRepository.findRoleByUuidWithUsers(uuid);

    if (!role) {
      throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);
    }

    return new SuccessResponseDto(
      true,
      'Usuarios obtenidos exitosamente!',
      role.user_roles.map((userRole) => userRole.user),
    );
  }
}
