import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/users/entities/user.entity';
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dto/create-center.dto';
import { ImportCentersDto } from './dto/import-centers.dto';
import { UpdateCenterDto } from './dto/update-center.dto';

@ApiTags('Centers')
@Controller({
  path: 'centers',
  version: '1',
})
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Post()
  @Auth(Permissions.CentersCreate)
  create(
    @Body() createCenterDto: CreateCenterDto,
    @GetUser() currentUser: User,
  ) {
    return this.centersService.create(createCenterDto, currentUser);
  }

  @Post('import')
  @Auth(Permissions.CentersCreate)
  import(
    @Body() importCentersDto: ImportCentersDto,
    @GetUser() currentUser: User,
  ) {
    return this.centersService.import(importCentersDto, currentUser);
  }

  @Get('import-template')
  @Auth(Permissions.CentersCreate)
  getImportTemplate() {
    return this.centersService.getImportTemplate();
  }

  @Get('catalog')
  @Auth(Permissions.CentersView)
  getCentersCatalog() {
    return this.centersService.getCentersCatalog();
  }

  @Get()
  @Auth(Permissions.CentersView)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.centersService.findAll(paginationDto);
  }

  @Get(':uuid')
  @Auth(Permissions.CentersView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.centersService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.CentersUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateCenterDto: UpdateCenterDto,
    @GetUser() currentUser: User,
  ) {
    return this.centersService.update(uuid, updateCenterDto, currentUser);
  }

  @Delete(':uuid')
  @Auth(Permissions.CentersDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.centersService.remove(uuid, currentUser);
  }
}
