import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  create(product: DeepPartial<Product>): Product {
    return this.repository.create(product);
  }

  save(product: Product): Promise<Product> {
    return this.repository.save(product);
  }

  findAll(paginationDto: PaginationDto): Promise<[Product[], number]> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    return this.repository.findAndCount({
      where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });
  }

  findByUuid(uuid: string): Promise<Product | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }
}
