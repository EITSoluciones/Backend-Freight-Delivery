import { Controller, Get, Body, Patch, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Modules')
@Controller({
  path: 'modules',
  version: '1',
})
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.modulesService.findAll(paginationDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.modulesService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(uuid, updateModuleDto);
  }
}
