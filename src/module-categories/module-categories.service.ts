import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ModuleCategory } from './entities/module-category.entity';
import { CreateModuleCategoryDto } from './dto/create-module-category.dto';
import { UpdateModuleCategoryDto } from './dto/update-module-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ModuleCategoriesService {

  constructor(
    @InjectRepository(ModuleCategory)
    private readonly moduleCategoryRepository: Repository<ModuleCategory>,
  ) { }

  async create(createModuleCategoryDto: CreateModuleCategoryDto) {
    try {
      const moduleCategory = this.moduleCategoryRepository.create(createModuleCategoryDto);
      const savedModuleCategory = await this.moduleCategoryRepository.save(moduleCategory);

      return {
        success: true,
        message: "Categoría de Módulo Creada Exitosamente!",
        data: savedModuleCategory,
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1, is_active } = paginationDto;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const [moduleCategories, total] = await this.moduleCategoryRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      message: "Categorías de Módulos obtenidas exitosamente!",
      data: moduleCategories,
      pagination: {
        pageNumber: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasPreviousPage: (page > 1),
        hasNextPage: (total > (page * limit)),
      }
    };
  }

  async findOne(uuid: string) {
    const moduleCategory = await this.moduleCategoryRepository.findOne({ where: { uuid } });

    if (!moduleCategory) {
      throw new NotFoundException(`La categoría de módulo con uuid ${uuid} no se encontró!`);
    }

    return {
      success: true,
      message: "Categoría de Módulo Encontrada!",
      data: moduleCategory,
    };
  }

  async update(uuid: string, updateModuleCategoryDto: UpdateModuleCategoryDto) {
    const moduleCategoryToUpdate = await this.moduleCategoryRepository.findOne({ where: { uuid } });

    if (!moduleCategoryToUpdate) throw new NotFoundException(`Categoría de Módulo con uuid: ${uuid} no encontrada`);

    try {
      Object.assign(moduleCategoryToUpdate, updateModuleCategoryDto);
      const updatedModuleCategory = await this.moduleCategoryRepository.save(moduleCategoryToUpdate);

      return {
        success: true,
        message: "Categoría de Módulo actualizada exitosamente!",
        data: updatedModuleCategory,
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(uuid: string) {
    const moduleCategory = await this.moduleCategoryRepository.findOne({ where: { uuid } });

    if (!moduleCategory) {
      throw new NotFoundException(`La categoría de módulo con uuid ${uuid} no se encontró!`);
    }

    await this.moduleCategoryRepository.softDelete({ uuid });

    return {
      success: true,
      message: "Categoría de Módulo eliminada exitosamente!",
      data: moduleCategory,
    };
  }

  private handleDBErrors(error: any): never {
    if (error instanceof NotFoundException) throw error;

    if (error instanceof QueryFailedError) {
      if ((error as any).errno === 1062) {
        throw new BadRequestException((error as any).detail || (error as any).sqlMessage || 'Registro Duplicado');
      }
    }

    console.error(error);
    throw new InternalServerErrorException('Error del Servidor. Porfavor contacte al administrador del sistema!');
  }
}
