import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Center } from '../entities/center.entity';

@Injectable()
export class CentersRepository {
  constructor(
    @InjectRepository(Center)
    private readonly repository: Repository<Center>,
  ) {}

  create(center: DeepPartial<Center>): Center {
    return this.repository.create(center);
  }

  save(center: Center): Promise<Center> {
    return this.repository.save(center);
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

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }
}
