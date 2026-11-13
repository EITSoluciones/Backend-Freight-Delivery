import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesQueryDto } from './dto/modules-query.dto';
import { SortModulesDto } from './dto/sort-modules.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { User } from 'src/users/entities/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Modules')
@Controller({
  path: 'modules',
  version: '1',
})
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  /** Obtener Módulos */
  @Get()
  @Auth()
  findAll(@Query() queryDto: ModulesQueryDto) {
    return this.modulesService.findAll(queryDto);
  }

  /** Obtener Catálogo de Módulos */
  @Get('catalog')
  @Auth()
  getModulesCatalog() {
    return this.modulesService.getModulesCatalog();
  }

  /** Obtener Módulo */
  @Get(':uuid')
  @Auth()
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.modulesService.findOne(uuid);
  }

  /** Reordenar Módulos de una Categoría */
  @Patch('sort-order')
  @Auth(Permissions.ModuleCategoriesUpdate)
  sortModules(
    @Body() sortModulesDto: SortModulesDto,
    @GetUser() currentUser: User,
  ) {
    return this.modulesService.sortModules(sortModulesDto, currentUser);
  }

  /** Actualizar Módulo */
  @Patch(':uuid')
  @Auth(Permissions.ModuleCategoriesUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @GetUser() currentUser: User,
  ) {
    return this.modulesService.update(uuid, updateModuleDto, currentUser);
  }
}
