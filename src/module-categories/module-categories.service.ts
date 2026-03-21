import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleCategory } from './entities/module-category.entity';
import { CreateModuleCategoryDto } from './dto/create-module-category.dto';
import { UpdateModuleCategoryDto } from './dto/update-module-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';

@Injectable()
export class ModuleCategoriesService {
  constructor(
    @InjectRepository(ModuleCategory)
    private readonly moduleCategoryRepository: Repository<ModuleCategory>,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) {}

  async create(
    createModuleCategoryDto: CreateModuleCategoryDto,
  ): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategory = this.moduleCategoryRepository.create(
      createModuleCategoryDto,
    );
    const savedModuleCategory =
      await this.moduleCategoryRepository.save(moduleCategory);

    return new SuccessResponseDto(
      true,
      'Categoría de Módulo Creada Exitosamente!',
      savedModuleCategory,
    );
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<ModuleCategory>> {
    const { limit = 10, page = 1, is_active } = paginationDto;
    const offset = (page - 1) * limit;

    const bool = is_active === 'true';

    const where = {
      ...(bool !== undefined && { is_active: bool }),
    };

    const [moduleCategories, total] =
      await this.moduleCategoryRepository.findAndCount({
        where,
        take: limit,
        skip: offset,
      });

    return PaginatedResponse.create(
      moduleCategories,
      total,
      page,
      limit,
      'Categorías de Módulos obtenidos exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategory = await this.moduleCategoryRepository.findOne({
      where: { uuid },
    });

    if (!moduleCategory) {
      throw new NotFoundException(
        `La categoría de módulo con uuid ${uuid} no se encontró!`,
      );
    }

    return new SuccessResponseDto(
      true,
      'Categoría de Módulo Encontrado!',
      moduleCategory,
    );
  }

  async update(
    uuid: string,
    updateModuleCategoryDto: UpdateModuleCategoryDto,
  ): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategoryToUpdate = await this.moduleCategoryRepository.findOne({
      where: { uuid },
    });

    if (!moduleCategoryToUpdate)
      throw new NotFoundException(
        `Categoría de Módulo con uuid: ${uuid} no encontrado`,
      );

    Object.assign(moduleCategoryToUpdate, updateModuleCategoryDto);
    const updatedModuleCategory = await this.moduleCategoryRepository.save(
      moduleCategoryToUpdate,
    );

    return new SuccessResponseDto(
      true,
      'Categoría de Módulo actualizado exitosamente!',
      updatedModuleCategory,
    );
  }

  async remove(uuid: string): Promise<SuccessResponseDto<ModuleCategory>> {
    const moduleCategory = await this.moduleCategoryRepository.findOne({
      where: { uuid },
    });

    if (!moduleCategory)
      throw new NotFoundException(
        `La categoría de módulo con uuid ${uuid} no se encontró!`,
      );

    await this.moduleCategoryRepository.softDelete({ uuid });

    return new SuccessResponseDto(
      true,
      'Categoría de Módulo eliminada exitosamente!',
      moduleCategory,
    );
  }

  async getCategoriesCatalog(): Promise<SuccessResponseDto<ModuleCategory[]>> {
    const categories = await this.moduleCategoryRepository.find({
      where: { is_active: true },
    });
    return new SuccessResponseDto(
      true,
      'Categorías obtenidos exitosamente!',
      categories,
    );
  }
}
