import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';
import { Module } from '../entities/module.entity';

@Injectable()
export class ModulesRepository {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(ModuleCategory)
    private readonly moduleCategoryRepository: Repository<ModuleCategory>,
  ) {}

  save(module: Module): Promise<Module> {
    return this.moduleRepository.save(module);
  }

  findAll(paginationDto: PaginationDto): Promise<[Module[], number]> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    return this.moduleRepository.findAndCount({
      where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['module_category'],
    });
  }

  findByUuid(uuid: string): Promise<Module | null> {
    return this.moduleRepository.findOne({ where: { uuid } });
  }

  findByUuidWithCategory(uuid: string): Promise<Module | null> {
    return this.moduleRepository.findOne({
      where: { uuid },
      relations: ['module_category'],
    });
  }

  findCategoryByUuid(uuid: string): Promise<ModuleCategory | null> {
    return this.moduleCategoryRepository.findOne({ where: { uuid } });
  }
}
