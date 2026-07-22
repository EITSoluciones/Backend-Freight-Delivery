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
    const { limit = 10, page = 1, is_active } = paginationDto;

    return this.repository.findAndCount({
      where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  findByUuid(uuid: string): Promise<ModuleCategory | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  findActive(): Promise<ModuleCategory[]> {
    return this.repository.find({ where: { is_active: true } });
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }
}
