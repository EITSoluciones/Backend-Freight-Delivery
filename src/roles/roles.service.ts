import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly dbErrorHandler: DBErrorHandlerService

  ) { }

  /** Obtener Catálogo de Roles */
  async getRolesCatalog() {
    const roles = await this.roleRepository.find({ where: { is_active: true } });
    return {
      message: "Roles obtenidos exitosamente!",
      data: roles,
    };
  }

  /** Obtener Catálogo de Permisos */
  async getPermissionsCatalog() {

    const permissions = await this.permissionRepository.find({
      where: { is_active: true },
      relations: ['module']
    });

    return {
      message: "Permisos obtenidos exitosamente!",
      data: permissions,
    };
  }

  /** Crear Rol */
  async create(createRoleDto: CreateRoleDto) {
    try {

      const roleCategory = this.roleRepository.create(createRoleDto);
      const savedRole = await this.roleRepository.save(roleCategory);

      return {
        message: "Rol Creado Exitosamente!",
        data: savedRole,
      };

    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }

  }

  /** Obtener Roles */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1, is_active } = paginationDto;
    const offset = (page - 1) * limit;

    const bool = is_active === "true"; // TODO: PENDIENTE VALIDAR (El dto Paginación lo obtiene como string )

    const where = {
      ...(bool !== undefined && { is_active: bool }),
    };

    const [Roles, total] = await this.roleRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
    });

    return {
      message: "Roles obtenidos exitosamente!",
      data: Roles,
      pagination: {
        pageNumber: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasPreviousPage: (page > 1),
        hasNextPage: (total > (page * limit)),
      }
    };
  }

  /** Obtener Rol */
  async findOne(uuid: string) {

    //buscar por uuid
    const role = await this.roleRepository.findOne({ where: { uuid } });

    if (!role) {
      throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);
    }

    return {
      message: "Rol encontrado exitosamente!",
      data: role,
    };

  }

  /** Actualizar Rol */
  async update(uuid: string, updateRoleDto: UpdateRoleDto) {

    //buscar por uuid
    const roleToUpdate = await this.roleRepository.findOne({ where: { uuid } });

    if (!roleToUpdate) throw new NotFoundException(`Rol con uuid: ${uuid} no encontrada`);

    try {
      Object.assign(roleToUpdate, updateRoleDto);
      const updatedRole = await this.roleRepository.save(roleToUpdate);

      return {
        message: "Rol actualizado exitosamente!",
        data: updatedRole,
      };

    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  /** Eliminar Role */
  async remove(uuid: string) {

    //buscar por uuid
    const role = await this.roleRepository.findOne({ where: { uuid } });

    if (!role) throw new NotFoundException(`El Rol con uuid ${uuid} no se encontró!`);

    await this.roleRepository.softDelete({ uuid });

    return {
      message: "Rol eliminado exitosamente!",
      data: role,
    };
  }

  /** Obtener Módulos autorizados de Roles */
  async getAuthorizedModulesByRole(userRoles: Role[]) {

    //return {data: userRoles};
    const categoryMap = new Map<string, any>();

    userRoles.forEach(role => {
      role.permissions.forEach(permission => {
        const module = permission.module;
        if (!module || !module.is_active) return;

        const category = module.moduleCategory;

        const categoryKey = category.uuid;

        // Crear categoría si no existe
        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, {
            group: category.name || 'General',
            active: category.is_active,
            items: new Map<string, any>(),
          });
        }

        const categoryEntry = categoryMap.get(categoryKey);

        // Evitar módulos duplicados
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

    // Convertir Maps a arrays
    const authModules = Array.from(categoryMap.values()).map(category => ({
      group: category.group,
      active: category.active,
      items: Array.from(category.items.values()),
    }));

    return {
      message: "Módulos Autorizados obtenidos exitosamente!",
      data: authModules,
    };

  }

}
