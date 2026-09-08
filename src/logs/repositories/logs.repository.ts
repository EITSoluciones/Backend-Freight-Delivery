import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { QueryLogDto } from 'src/common/dto/query-log.dto';
import { SystemLog } from '../entities/system-log.entity';

@Injectable()
export class LogsRepository {
  constructor(
    @InjectRepository(SystemLog)
    private readonly repository: Repository<SystemLog>,
  ) {}

  saveMany(logs: SystemLog[]): Promise<SystemLog[]> {
    return this.repository.save(logs);
  }

  findAll(queryLogDto: QueryLogDto): Promise<[SystemLog[], number]> {
    const {
      limit = 10,
      page = 1,
      action,
      user_id,
      module_id,
      start_date,
      end_date,
    } = queryLogDto;

    return this.repository.findAndCount({
      where: {
        ...(action && { action }),
        ...(user_id && { userId: user_id }),
        ...(module_id && { moduleId: module_id }),
        ...(start_date &&
          end_date && {
            createdAt: Between(new Date(start_date), new Date(end_date)),
          }),
        ...(start_date &&
          !end_date && {
            createdAt: MoreThanOrEqual(new Date(start_date)),
          }),
        ...(!start_date &&
          end_date && {
            createdAt: LessThanOrEqual(new Date(end_date)),
          }),
      },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });
  }

  findByUserId(
    userId: number,
    paginationDto?: PaginationDto,
  ): Promise<[SystemLog[], number]> {
    const { limit = 10, page = 1 } = paginationDto || {};

    return this.repository.findAndCount({
      where: { userId },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });
  }
}
