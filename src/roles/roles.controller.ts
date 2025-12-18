import { Controller, Get, Post, Body, Patch, Param, Delete, ClassSerializerInterceptor, UseInterceptors, Query, ParseUUIDPipe, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from '../users/entities/user.entity';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  path: 'roles',
  version: '1',
})

export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  /** Obtener Catálogo de Permisos */
  @Get('permissions')
  @Auth()
  getPermissionsCatalog() {
    return this.rolesService.getPermissionsCatalog();
  }

  /** Obtener Permisos por Rol */
  @Get(':uuid/permissions')
  @Auth()
  getPermissionsByRole(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.rolesService.getPermissionsByRole(uuid);
  }

  /** Actualizar Permisos al Rol */
  @Put(':uuid/permissions')
  @Auth()
  updatePermissionsByRole(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updatePermissionsByRole(uuid, updateRolePermissionsDto);
  }


  /** Obtener Catálogo de Roles */
  @Get('catalog')
  @Auth()
  getRolesCatalog() {
    return this.rolesService.getRolesCatalog();
  }

  /** Obtener Catálogo de módulos autorizados en el Rol*/
  @Get('authorized-modules')
  @Auth()
  getAuthorizedModulesByRole(@GetUser() user: User) {
    return this.rolesService.getAuthorizedModulesByRole(user.roles);
  }

  /** Crear Rol */
  @Post()
  @Auth()
  create(@Body() CreateRoleDto: CreateRoleDto) {
    return this.rolesService.create(CreateRoleDto);
  }

  /** Obtener Roles */
  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.rolesService.findAll(paginationDto);
  }

  /** Obtener Rol */
  @Get(':uuid')
  @Auth()
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.rolesService.findOne(uuid);
  }

  /** Actualizar Rol */
  @Patch(':uuid')
  @Auth()
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(uuid, updateRoleDto);
  }

  /** Eliminar Rol */
  @Delete(':uuid')
  @Auth()
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.rolesService.remove(uuid);
  }



}
