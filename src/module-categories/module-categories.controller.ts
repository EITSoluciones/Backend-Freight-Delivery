import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ModuleCategoriesService } from './module-categories.service';
import { CreateModuleCategoryDto } from './dto/create-module-category.dto';
import { UpdateModuleCategoryDto } from './dto/update-module-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';


@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  path: 'module-categories',
  version: '1',
})
export class ModuleCategoriesController {
  constructor(private readonly moduleCategoriesService: ModuleCategoriesService) { }

  /** Obtener Catálogo de Categorías */
  @Get('catalog')
  @Auth()
  getCategoriesCatalog() {
    return this.moduleCategoriesService.getCategoriesCatalog();
  }

  /** Crear Categoría */
  @Post()
  @Auth(Permissions.ModuleCategoriesCreate)
  create(@Body() createModuleCategoryDto: CreateModuleCategoryDto) {
    return this.moduleCategoriesService.create(createModuleCategoryDto);
  }

  /** Obtener Categorías */
  @Get()
  @Auth(Permissions.ModuleCategoriesView)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.moduleCategoriesService.findAll(paginationDto);
  }

  /** Obtener Categoría */
  @Get(':uuid')
  @Auth(Permissions.ModuleCategoriesView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.moduleCategoriesService.findOne(uuid);
  }

  /** Actualizar Categoría */
  @Patch(':uuid')
  @Auth(Permissions.ModuleCategoriesUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateModuleCategoryDto: UpdateModuleCategoryDto,
  ) {
    return this.moduleCategoriesService.update(uuid, updateModuleCategoryDto);
  }

  /** Eliminar Categoría */
  @Delete(':uuid')
  @Auth(Permissions.ModuleCategoriesDelete)
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.moduleCategoriesService.remove(uuid);
  }
}
