import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Module } from './entities/module.entity';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';

@Injectable()
export class ModulesService {

  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(ModuleCategory)
    private readonly moduleCategoryRepository: Repository<ModuleCategory>,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) { }

  /** Obtener Módulos */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1, is_active } = paginationDto;
    const offset = (page - 1) * limit;

    const bool = is_active === "true";

    const where = {
      ...(bool !== undefined && { is_active: bool }),
    };

    const [modules, total] = await this.moduleRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
      relations: ['module_category'],
    });

    return {
      message: "Módulos obtenidos exitosamente!",
      data: modules,
      pagination: {
        pageNumber: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasPreviousPage: (page > 1),
        hasNextPage: (total > (page * limit)),
      }
    };

  }

  /** Obtener Módulo */
  async findOne(uuid: string) {

    //buscar por uuid
    const module = await this.moduleRepository.findOne({ where: { uuid }, relations: ['module_category'] });

    if (!module) {
      throw new NotFoundException(`El módulo con uuid ${uuid} no se encontró!`);
    }

    return {
      success: true,
      message: "Módulo Encontrado!",
      data: module,
    };

  }

  /** Actualizar Módulo */
  async update(uuid: string, updateModuleDto: UpdateModuleDto) {

    // 1. Buscar el módulo por uuid
    const moduleToUpdate = await this.moduleRepository.findOne({
      where: { uuid },
    });

    if (!moduleToUpdate) {
      throw new NotFoundException(`Módulo con uuid: ${uuid} no encontrado`);
    }

    // 2. Si viene el uuid de la categoría, resolver su ID
    if (updateModuleDto.module_category_uuid) {

      const category = await this.moduleCategoryRepository.findOne({
        where: { uuid: updateModuleDto.module_category_uuid },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoría con uuid: ${updateModuleDto.module_category_uuid} no encontrado`,
        );
      }

      // 3. Asignar la relación usando el ID interno
      moduleToUpdate.module_category_id = category.id;

      console.log("Módulo", moduleToUpdate);
      
    }

    try {
      // 4. Asignar el resto de campos (si hubiera más)
      Object.assign(moduleToUpdate, updateModuleDto);
      const updatedModule = await this.moduleRepository.save(moduleToUpdate);

      return {
        message: 'Módulo actualizado exitosamente!',
        data: updatedModule,
      };

    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }

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
