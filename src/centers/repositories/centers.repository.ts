import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, In, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Center } from '../entities/center.entity';

@Injectable()
export class CentersRepository {
  constructor(
    @InjectRepository(Center)
    private readonly repository: Repository<Center>,
    private readonly dataSource: DataSource,
  ) {}

  create(center: DeepPartial<Center>): Center {
    return this.repository.create(center);
  }

  save(center: Center): Promise<Center> {
    return this.repository.save(center);
  }

  createMany(centers: DeepPartial<Center>[]): Promise<Center[]> {
    return this.dataSource.transaction((manager) =>
      manager.save(manager.create(Center, centers)),
    );
  }

  findAll(paginationDto: PaginationDto): Promise<[Center[], number]> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    return this.repository.findAndCount({
      where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  findByUuid(uuid: string): Promise<Center | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  findByCodes(codes: string[]): Promise<Center[]> {
    return this.repository.find({ where: { code: In(codes) } });
  }

  findByUuids(uuids: string[]): Promise<Center[]> {
    return this.repository.find({ where: { uuid: In(uuids) } });
  }

  findActive(): Promise<Center[]> {
    return this.repository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }
}
