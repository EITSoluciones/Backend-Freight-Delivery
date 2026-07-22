import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DeliveryDriver } from '../entities/delivery-driver.entity';

@Injectable()
export class DeliveryDriversRepository {
  constructor(
    @InjectRepository(DeliveryDriver)
    private readonly repository: Repository<DeliveryDriver>,
  ) {}

  create(driver: DeepPartial<DeliveryDriver>): DeliveryDriver {
    return this.repository.create(driver);
  }

  save(driver: DeliveryDriver): Promise<DeliveryDriver> {
    return this.repository.save(driver);
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }

  findAll(paginationDto?: PaginationDto): Promise<[DeliveryDriver[], number]> {
    const { limit = 10, page = 1 } = paginationDto || {};

    return this.repository.findAndCount({
      relations: [
        'user',
        'vehicle_assignments',
        'vehicle_assignments.delivery_vehicle',
      ],
      order: {
        created_at: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  findByUuid(uuid: string): Promise<DeliveryDriver | null> {
    return this.repository.findOne({
      where: { uuid },
      relations: [
        'user',
        'vehicle_assignments',
        'vehicle_assignments.delivery_vehicle',
      ],
    });
  }

  findByUserId(userId: number): Promise<DeliveryDriver | null> {
    return this.repository.findOne({
      where: {
        user_id: userId,
      },
    });
  }
}
