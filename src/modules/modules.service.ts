import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Module } from './entities/module.entity';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ModulesService {

  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
  ) { }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1, is_active } = paginationDto;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const [modules, total] = await this.moduleRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
      relations: ['moduleCategory'],
    });

    return {
      success: true,
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

  async findOne(uuid: string) {
    const module = await this.moduleRepository.findOne({
      where: { uuid },
      relations: ['moduleCategory'],
    });

    if (!module) {
      throw new NotFoundException(`El módulo con uuid ${uuid} no se encontró!`);
    }

    return {
      success: true,
      message: "Módulo Encontrado!",
      data: module,
    };
  }

  async update(uuid: string, updateModuleDto: UpdateModuleDto) {
    const moduleToUpdate = await this.moduleRepository.findOne({ where: { uuid } });

    if (!moduleToUpdate) throw new NotFoundException(`Módulo con uuid: ${uuid} no encontrado`);

    try {
      Object.assign(moduleToUpdate, updateModuleDto);
      const updatedModule = await this.moduleRepository.save(moduleToUpdate);

      return {
        success: true,
        message: "Módulo actualizado exitosamente!",
        data: updatedModule,
      };

    } catch (error) {
      this.handleDBErrors(error);
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
