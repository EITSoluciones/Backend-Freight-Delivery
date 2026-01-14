import { Controller, Get, Body, Patch, Param, Query, ParseUUIDPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';

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
  findAll(@Query() paginationDto: PaginationDto) {
    return this.modulesService.findAll(paginationDto);
  }

  /** Obtener Módulo */
  @Get(':uuid')
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.modulesService.findOne(uuid);
  }

  /** Actualizar Módulo */
  @Patch(':uuid')
  @Auth()
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(uuid, updateModuleDto);
  }
}
