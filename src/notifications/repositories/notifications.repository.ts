import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  create(notification: DeepPartial<Notification>): Notification {
    return this.repository.create(notification);
  }

  save(notification: Notification): Promise<Notification> {
    return this.repository.save(notification);
  }

  findAll(paginationDto: PaginationDto): Promise<[Notification[], number]> {
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

  findByUuid(uuid: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  findActiveByUuid(uuid: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { uuid, is_active: true } });
  }

  findByCode(code: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { code, is_active: true } });
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }
}
