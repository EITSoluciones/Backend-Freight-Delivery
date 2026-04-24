import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly dbErrorHandler: DBErrorHandlerService,
    private readonly logsService: LogsService,
  ) {}

  /** Obtener Catálogo de Roles */
  async getRolesCatalog(): Promise<SuccessResponseDto<Role[]>> {
    const roles = await this.roleRepository.find({
      where: { is_active: true },
    });
    return new SuccessResponseDto(true, 'Roles obtenidos exitosamente!', roles);
  }

  /** Obtener Catálogo de Permisos */
  async getPermissionsCatalog(): Promise<SuccessResponseDto<Permission[]>> {
    const permissions = await this.permissionRepository.find({
      where: { is_active: true },
      relations: ['module'],
    });

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
      const roleCategory = this.roleRepository.create(createRoleDto);
      const savedRole = await this.roleRepository.save(roleCategory);

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

    const bool = is_active === 'true';

    const where = {
      ...(bool !== undefined && { is_active: bool }),
    };

    const [Roles, total] = await this.roleRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
    });

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
    const role = await this.roleRepository.findOne({ where: { uuid } });

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
    const roleToUpdate = await this.roleRepository.findOne({ where: { uuid } });

    if (!roleToUpdate)
      throw new NotFoundException(`Rol con uuid: ${uuid} no encontrada`);

    try {
      const oldData = { ...roleToUpdate };
      Object.assign(roleToUpdate, updateRoleDto);
      const updatedRole = await this.roleRepository.save(roleToUpdate);

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
    const role = await this.roleRepository.findOne({ where: { uuid } });

    if (!role)
      throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);

    await this.roleRepository.softDelete({ uuid });

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
        if (!module || !module.is_active) return;

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
    const role = await this.roleRepository.findOne({
      where: { uuid },
      relations: ['permissions'],
    });

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
    const role = await this.roleRepository.findOne({
      where: { uuid },
      relations: ['permissions'],
    });

    if (!role)
      throw new NotFoundException(`Rol con uuid: ${uuid} no encontrada`);

    try {
      const oldPermissions = role.permissions.map((p) => p.uuid);

      const permissions = await this.permissionRepository.findBy({
        uuid: In(updateRolePermissionsDto.permissionUuids),
        is_active: true,
      });

      if (
        permissions.length !==
        new Set(updateRolePermissionsDto.permissionUuids).size
      ) {
        throw new BadRequestException(
          'Uno o más permisos no existen o están inactivos',
        );
      }

      role.permissions = permissions;

      await this.roleRepository.save(role);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ROLES,
        action: LogAction.UPDATE,
        entityUuid: role.uuid,
        entityName: role.name,
        description: `Permisos actualizados para rol: ${role.name}`,
        oldData: { permissions: oldPermissions },
        newData: { permissions: updateRolePermissionsDto.permissionUuids },
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
    const role = await this.roleRepository.findOne({
      where: { uuid },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);
    }
    
    return new SuccessResponseDto(
      true,
      'Usuarios obtenidos exitosamente!',
      role.users,
    );
  }
}
