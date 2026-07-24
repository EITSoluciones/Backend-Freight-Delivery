import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';
import { Address } from '../entities/address.entity';

@Injectable()
export class AddressesRepository {
  constructor(
    @InjectRepository(Address)
    private readonly repository: Repository<Address>,
  ) {}

  create(address: DeepPartial<Address>): Address {
    return this.repository.create(address);
  }

  merge(address: Address, data: DeepPartial<Address>): Address {
    return this.repository.merge(address, data);
  }

  save(address: Address): Promise<Address> {
    return this.repository.save(address);
  }

  saveMany(addresses: Address[]): Promise<Address[]> {
    return this.repository.save(addresses);
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }

  findByUuid(uuid: string): Promise<Address | null> {
    return this.repository.findOne({
      where: { uuid },
      relations: ['customer'],
    });
  }

  findPrimaryByCustomerId(
    customerId: number,
    excludeAddressId?: number,
  ): Promise<Address | null> {
    return this.repository.findOne({
      where: {
        customer: { id: customerId },
        is_primary: true,
        ...(excludeAddressId && { id: Not(excludeAddressId) }),
      },
    });
  }
}
