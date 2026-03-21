import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './entities/module.entity';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(ModuleCategory)
    private readonly moduleCategoryRepository: Repository<ModuleCategory>,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Module>> {
    const { limit = 10, page = 1, is_active } = paginationDto;
    const offset = (page - 1) * limit;

    const bool = is_active === 'true';

    const where = {
      ...(bool !== undefined && { is_active: bool }),
    };

    const [modules, total] = await this.moduleRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
      relations: ['module_category'],
    });

    return PaginatedResponse.create(
      modules,
      total,
      page,
      limit,
      'Módulos obtenidos exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Module>> {
    const module = await this.moduleRepository.findOne({
      where: { uuid },
      relations: ['module_category'],
    });

    if (!module) {
      throw new NotFoundException(`El módulo con uuid ${uuid} no se encontró!`);
    }

    return new SuccessResponseDto(true, 'Módulo Encontrado!', module);
  }

  async update(
    uuid: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<SuccessResponseDto<Module>> {
    const moduleToUpdate = await this.moduleRepository.findOne({
      where: { uuid },
    });

    if (!moduleToUpdate) {
      throw new NotFoundException(`Módulo con uuid: ${uuid} no encontrado`);
    }

    if (updateModuleDto.module_category_uuid) {
      const category = await this.moduleCategoryRepository.findOne({
        where: { uuid: updateModuleDto.module_category_uuid },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoría con uuid: ${updateModuleDto.module_category_uuid} no encontrado`,
        );
      }

      moduleToUpdate.module_category_id = category.id;
    }

    Object.assign(moduleToUpdate, updateModuleDto);
    const updatedModule = await this.moduleRepository.save(moduleToUpdate);

    return new SuccessResponseDto(
      true,
      'Módulo actualizado exitosamente!',
      updatedModule,
    );
  }
}
