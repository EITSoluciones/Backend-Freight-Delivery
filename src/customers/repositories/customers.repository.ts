import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, Repository } from 'typeorm';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { Customer } from '../entities/customer.entity';

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

  findAll(queryDto: QueryCustomerDto): Promise<[Customer[], number]> {
    const { limit = 10, page = 1, start_date, end_date } = queryDto;

    return this.repository.findAndCount({
      where:
        start_date && end_date
          ? { created_at: Between(new Date(start_date), new Date(end_date)) }
          : {},
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
}
