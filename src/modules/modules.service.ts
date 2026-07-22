import { Injectable, NotFoundException } from '@nestjs/common';
import { Module } from './entities/module.entity';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { ModulesRepository } from './repositories/modules.repository';

@Injectable()
export class ModulesService {
  constructor(
    private readonly modulesRepository: ModulesRepository,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Module>> {
    const { limit = 10, page = 1 } = paginationDto;

    const [modules, total] = await this.modulesRepository.findAll(paginationDto);

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

  async update(
    uuid: string,
    updateModuleDto: UpdateModuleDto,
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

    Object.assign(moduleToUpdate, updateModuleDto);
    const updatedModule = await this.modulesRepository.save(moduleToUpdate);

    return new SuccessResponseDto(
      true,
      'Módulo actualizado exitosamente!',
      updatedModule,
    );
  }
}
