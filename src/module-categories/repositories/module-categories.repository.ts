
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ModuleCategory } from '../entities/module-category.entity';

@Injectable()
export class ModuleCategoriesRepository {
  constructor(
    @InjectRepository(ModuleCategory)
    private readonly repository: Repository<ModuleCategory>,
  ) {}

  create(category: DeepPartial<ModuleCategory>): ModuleCategory {
    return this.repository.create(category);
  }

  save(category: ModuleCategory): Promise<ModuleCategory> {
    return this.repository.save(category);
  }

  findAll(paginationDto: PaginationDto): Promise<[ModuleCategory[], number]> {
    const { is_active, search } = paginationDto;
    const term = search?.trim();
    const isActive = is_active !== undefined ? is_active === 'true' : undefined;

    const qb = this.repository.createQueryBuilder('category');

    if (term) {
      const like = `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
      qb.leftJoinAndSelect(
        'category.modules',
        'module',
        '(module.name LIKE :like OR module.description LIKE :like)',
        { like },
      ).andWhere(
        `(category.name LIKE :like
        OR category.description LIKE :like
        OR EXISTS (
          SELECT 1 FROM modules m
          WHERE m.module_category_id = category.id
            AND m.deleted_at IS NULL
            AND (m.name LIKE :like OR m.description LIKE :like)
        ))`,
      );
    } else {
      qb.leftJoinAndSelect('category.modules', 'module');
    }

    if (isActive !== undefined) {
      qb.andWhere('category.is_active = :isActive', { isActive });
    }

    return qb
      .orderBy('ISNULL(category.sort_order)', 'ASC')
      .addOrderBy('category.sort_order', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .addOrderBy('ISNULL(module.sort_order)', 'ASC')
      .addOrderBy('module.sort_order', 'ASC')
      .addOrderBy('module.name', 'ASC')
      .getManyAndCount();
  }

  findByUuid(uuid: string): Promise<ModuleCategory | null> {
    return this.repository.findOne({
      where: { uuid },
    });
  }

  findActive(): Promise<ModuleCategory[]> {
    return this.repository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }

  async sortCategories(orderedUuids: string[]): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      for (const [index, uuid] of orderedUuids.entries()) {
        await manager.update(
          ModuleCategory,
          { uuid },
          { sort_order: index + 1 },
        );
      }
    });
  }
}

