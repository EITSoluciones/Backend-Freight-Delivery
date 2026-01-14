import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ModuleCategory } from './entities/module-category.entity';
import { CreateModuleCategoryDto } from './dto/create-module-category.dto';
import { UpdateModuleCategoryDto } from './dto/update-module-category.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';

@Injectable()
export class ModuleCategoriesService {

  //inyecciones 
  constructor(
    @InjectRepository(ModuleCategory)
    private readonly moduleCategoryRepository: Repository<ModuleCategory>,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) { }

  /** Crear Categoría */
  async create(createModuleCategoryDto: CreateModuleCategoryDto) {
    try {

      const moduleCategory = this.moduleCategoryRepository.create(createModuleCategoryDto);
      const savedModuleCategory = await this.moduleCategoryRepository.save(moduleCategory);

      return {
        message: "Categoría de Módulo Creada Exitosamente!",
        data: savedModuleCategory,
      };

    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }

  }

  /** Obtener Categorías */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1, is_active } = paginationDto;
    const offset = (page - 1) * limit;

    const bool = is_active === "true"; // TODO: PENDIENTE VALIDAR (El dto lo obtiene como string)

    const where = {
      ...(bool !== undefined && { is_active: bool }),
    };

    const [moduleCategories, total] = await this.moduleCategoryRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
    });

    return {
      message: "Categorías de Módulos obtenidos exitosamente!",
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

  /** Obtener Categoría */
  async findOne(uuid: string) {

    //buscar por uuid
    const moduleCategory = await this.moduleCategoryRepository.findOne({ where: { uuid } });

    if (!moduleCategory) {
      throw new NotFoundException(`La categoría de módulo con uuid ${uuid} no se encontró!`);
    }

    return {
      success: true,
      message: "Categoría de Módulo Encontrado!",
      data: moduleCategory,
    };

  }

  /** Actualizar Categoría */
  async update(uuid: string, updateModuleCategoryDto: UpdateModuleCategoryDto) {

    //buscar por uuid
    const moduleCategoryToUpdate = await this.moduleCategoryRepository.findOne({ where: { uuid } });

    if (!moduleCategoryToUpdate) throw new NotFoundException(`Categoría de Módulo con uuid: ${uuid} no encontrado`);

    try {
      Object.assign(moduleCategoryToUpdate, updateModuleCategoryDto);
      const updatedModuleCategory = await this.moduleCategoryRepository.save(moduleCategoryToUpdate);

      return {
        message: "Categoría de Módulo actualizado exitosamente!",
        data: updatedModuleCategory,
      };

    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  /** Eliminar Categoría */
  async remove(uuid: string) {

     //buscar por uuid
    const moduleCategory = await this.moduleCategoryRepository.findOne({ where: { uuid } });

    if (!moduleCategory) throw new NotFoundException(`La categoría de módulo con uuid ${uuid} no se encontró!`);
    
    await this.moduleCategoryRepository.softDelete({ uuid });

    return {
      message: "Categoría de Módulo eliminada exitosamente!",
      data: moduleCategory,
    };
  }

  /** Obtener Catálogo de Categorías */
  async getCategoriesCatalog() {
    const categories = await this.moduleCategoryRepository.find({ where: { is_active: true } });
    return {
      message: "Categorías obtenidos exitosamente!",
      data: categories,
    };
  }
}
