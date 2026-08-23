import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  create(order: DeepPartial<Order>): Order {
    return this.repository.create(order);
  }

  save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }

  findAll(paginationDto: PaginationDto): Promise<[Order[], number]> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    return this.repository.findAndCount({
      where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
      relations: { customer: true, origin_center: true },
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  findByUuid(uuid: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { uuid },
      relations: { customer: true, origin_center: true },
    });
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }
}
