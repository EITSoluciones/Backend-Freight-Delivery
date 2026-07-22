import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryCatalog } from '../entities/delivery-catalog.entity';

@Injectable()
export class DeliveryCatalogsRepository {
  constructor(
    @InjectRepository(DeliveryCatalog)
    private readonly repository: Repository<DeliveryCatalog>,
  ) {}

  findActiveByCategory(category?: string): Promise<DeliveryCatalog[]> {
    return this.repository.find({
      where: {
        is_active: true,
        ...(category && { category }),
      },
      order: {
        category: 'ASC',
        sort_order: 'ASC',
        name: 'ASC',
      },
    });
  }

  async existsActiveCode(category: string, code: string): Promise<boolean> {
    const exists = await this.repository.exists({
      where: {
        category,
        code,
        is_active: true,
      },
    });

    return exists;
  }
}
