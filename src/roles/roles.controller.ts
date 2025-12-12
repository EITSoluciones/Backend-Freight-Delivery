import { Controller, Get, Post, Body, Patch, Param, Delete, ClassSerializerInterceptor, UseInterceptors, Query, ParseUUIDPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  path: 'roles',
  version: '1',
})

export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  /** Obtener Catálogo de Roles */
  @Get('catalog')
  @Auth()
  getCatalog() {
    return this.rolesService.getCatalog();
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
