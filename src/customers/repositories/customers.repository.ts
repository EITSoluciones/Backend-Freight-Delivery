import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  DeepPartial, Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  create(customer: DeepPartial<Customer>): Customer {
    return this.repository.create(customer);
  }

  merge(customer: Customer, data: DeepPartial<Customer>): Customer {
    return this.repository.merge(customer, data);
  }

  save(customer: Customer): Promise<Customer> {
    return this.repository.save(customer);
  }

  softRemove(customer: Customer): Promise<Customer> {
    return this.repository.softRemove(customer);
  }

  findAll(queryDto: PaginationDto): Promise<[Customer[], number]> {
    const { limit = 10, page = 1, is_active } = queryDto;

    return this.repository.findAndCount({
       where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
      take: limit,
      skip: (page - 1) * limit,
    }); 
  }

  async findByUuidWithActiveAddresses(uuid: string): Promise<Customer | null> {
    const customer = await this.repository.findOne({
      where: { uuid },
      relations: { addresses: true },
    });

    if (customer) {
      customer.addresses = customer.addresses.filter(
        (address) => address.is_active && !address.deleted_at,
      );
    }

    return customer;
  }

  findByUuidWithAddresses(uuid: string): Promise<Customer | null> {
    return this.repository.findOne({
      where: { uuid },
      relations: { addresses: true },
    });
  }

  findActive(){
    return this.repository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }
}
