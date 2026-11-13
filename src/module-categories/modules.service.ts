import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModulesQueryDto } from './dto/modules-query.dto';
import { SortModulesDto } from './dto/sort-modules.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { ModulesRepository } from './repositories/modules.repository';
import { Module } from './entities/module.entity';
import { LogsService } from 'src/logs/logs.service';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ModulesService {
  constructor(
    private readonly modulesRepository: ModulesRepository,
    private readonly logsService: LogsService,
  ) {}

  async getModulesCatalog(): Promise<SuccessResponseDto<Module[]>> {
    const modules = await this.modulesRepository.findActive();
    return new SuccessResponseDto(
      true,
      'Módulos obtenidos exitosamente!',
      modules,
    );
  }

  async findAll(
    queryDto: ModulesQueryDto,
  ): Promise<PaginatedResponse<Module>> {
    const { limit = 10, page = 1 } = queryDto;
    const [modules, total] = await this.modulesRepository.findAll(queryDto);
    return PaginatedResponse.create(
      modules,
      total,
      page,
      limit,
      'Módulos obtenidos exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Module>> {
    const module = await this.modulesRepository.findByUuidWithCategory(uuid);
    if (!module) {
      throw new NotFoundException(`El módulo con uuid ${uuid} no se encontró!`);
    }
    return new SuccessResponseDto(true, 'Módulo Encontrado!', module);
  }

  async sortModules(
    sortModulesDto: SortModulesDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Module[]>> {
    const { module_category_uuid, ordered_uuids } = sortModulesDto;

    const category = await this.modulesRepository.findCategoryByUuid(
      module_category_uuid,
    );
    if (!category) {
      throw new NotFoundException(
        `Categoría con uuid: ${module_category_uuid} no encontrada`,
      );
    }

    const modules = await this.modulesRepository.findByUuids(ordered_uuids);
    const allBelongToCategory =
      modules.length === ordered_uuids.length &&
      modules.every((module) => module.module_category_id === category.id);

    if (!allBelongToCategory) {
      throw new BadRequestException(
        'Todos los módulos deben pertenecer a la categoría indicada.',
      );
    }

    await this.modulesRepository.sortModules(category.id, ordered_uuids);

    const sortedModules = await this.modulesRepository.findByCategoryOrdered(
      category.id,
    );

    await this.logsService.log(currentUser || null, {
      module: LogModule.MODULES,
      action: LogAction.UPDATE,
      description: `Orden de módulos actualizado en categoría: ${category.name}`,
      newData: { module_category_uuid, ordered_uuids },
    });

    return new SuccessResponseDto(
      true,
      'Orden de módulos actualizado exitosamente!',
      sortedModules,
    );
  }

  async update(
    uuid: string,
    updateModuleDto: UpdateModuleDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Module>> {
    const moduleToUpdate = await this.modulesRepository.findByUuid(uuid);
    if (!moduleToUpdate) {
      throw new NotFoundException(`Módulo con uuid: ${uuid} no encontrado`);
    }

    if (updateModuleDto.module_category_uuid) {
      const category = await this.modulesRepository.findCategoryByUuid(
        updateModuleDto.module_category_uuid,
      );
      if (!category) {
        throw new NotFoundException(
          `Categoría con uuid: ${updateModuleDto.module_category_uuid} no encontrado`,
        );
      }
      moduleToUpdate.module_category_id = category.id;
    }

    const oldData = { ...moduleToUpdate };
    Object.assign(moduleToUpdate, updateModuleDto);
    const updatedModule = await this.modulesRepository.save(moduleToUpdate);

    await this.logsService.log(currentUser || null, {
      module: LogModule.MODULES,
      action: LogAction.UPDATE,
      description: `Módulo actualizado: ${updatedModule.name}. UUID: ${updatedModule.uuid}`,
      oldData,
      newData: updateModuleDto,
    });

    return new SuccessResponseDto(
      true,
      'Módulo actualizado exitosamente!',
      updatedModule,
    );
  }
}
