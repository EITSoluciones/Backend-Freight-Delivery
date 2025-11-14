import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ModuleCategoriesService } from './module-categories.service';
import { CreateModuleCategoryDto } from './dto/create-module-category.dto';
import { UpdateModuleCategoryDto } from './dto/update-module-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Module Categories')
@Controller({
  path: 'module-categories',
  version: '1',
})
export class ModuleCategoriesController {
  constructor(private readonly moduleCategoriesService: ModuleCategoriesService) {}

  @Post()
  create(@Body() createModuleCategoryDto: CreateModuleCategoryDto) {
    return this.moduleCategoriesService.create(createModuleCategoryDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.moduleCategoriesService.findAll(paginationDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.moduleCategoriesService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateModuleCategoryDto: UpdateModuleCategoryDto,
  ) {
    return this.moduleCategoriesService.update(uuid, updateModuleCategoryDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.moduleCategoriesService.remove(uuid);
  }
}
