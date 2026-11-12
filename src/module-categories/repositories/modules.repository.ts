
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';
import { Module } from '../entities/module.entity';
import { ModulesQueryDto } from '../dto/modules-query.dto';

@Injectable()
export class ModulesRepository {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(ModuleCategory)
    private readonly moduleCategoryRepository: Repository<ModuleCategory>,
    private readonly dataSource: DataSource,
  ) {}

  save(module: Module): Promise<Module> {
    return this.moduleRepository.save(module);
  }

  findAll(queryDto: ModulesQueryDto): Promise<[Module[], number]> {
    const { is_active, search, module_category_uuid } = queryDto;
    const term = search?.trim();
    const isActive = is_active !== undefined ? is_active === 'true' : undefined;

    const base: FindOptionsWhere<Module> = {
      ...(isActive !== undefined && { is_active: isActive }),
      ...(module_category_uuid && { module_category: { uuid: module_category_uuid } }),
    };

    let where: FindOptionsWhere<Module> | FindOptionsWhere<Module>[];

    if (term) {
      const like = `%${term.replace(/[%_\\]/g, (char) => `\\${char}`)}%`;
      where = [
        { ...base, name: Like(like) },
        { ...base, description: Like(like) },
      ];
    } else {
      where = base;
    }

    return this.moduleRepository.findAndCount({
      where,
      relations: { module_category: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  findActive(): Promise<Module[]> {
    return this.moduleRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  findByUuid(uuid: string): Promise<Module | null> {
    return this.moduleRepository.findOne({
      where: { uuid },
    });
  }

  findByUuids(uuids: string[]): Promise<Module[]> {
    return this.moduleRepository.find({
      where: {
        uuid: In(uuids),
      },
    });
  }

  findByUuidWithCategory(uuid: string): Promise<Module | null> {
    return this.moduleRepository.findOne({
      where: { uuid },
      relations: ['module_category'],
    });
  }

  findCategoryByUuid(uuid: string): Promise<ModuleCategory | null> {
    return this.moduleCategoryRepository.findOne({
      where: { uuid },
    });
  }

  findByCategoryOrdered(categoryId: number): Promise<Module[]> {
    return this.moduleRepository.find({
      where: { module_category_id: categoryId },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async sortModules(
    categoryId: number,
    orderedUuids: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const [index, uuid] of orderedUuids.entries()) {
        await manager.update(
          Module,
          {
            uuid,
            module_category_id: categoryId,
          },
          {
            sort_order: index + 1,
          },
        );
      }
    });
  }
}
