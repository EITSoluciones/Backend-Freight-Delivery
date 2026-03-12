import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  QueryFailedError,
  FindManyOptions,
  Between,
} from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { addresses, ...customerData } = createCustomerDto;

    if (!addresses || addresses.length === 0) {
      throw new BadRequestException('At least one address is required.');
    }

    this.ensureSinglePrimaryAddress(addresses);

    const customer = this.customerRepository.create({
      ...customerData,
      addresses: addresses.map((addr) => ({
        ...addr,
        is_primary: addr.is_primary || false,
      })),
    });

    try {
      const savedCustomer = await this.customerRepository.save(customer);
      return {
        success: true,
        message: 'Customer created successfully!',
        data: savedCustomer,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(queryCustomerDto: QueryCustomerDto) {
    const {
      limit = 10,
      page = 1,
      is_active,
      startDate,
      endDate,
    } = queryCustomerDto;

    const offset = (page - 1) * limit;

    const where: FindManyOptions<Customer>['where'] = {};

    // if (is_active !== undefined) {
    //   where.is_active = is_active;
    // }

    if (startDate && endDate) {
      where.created_at = Between(new Date(startDate), new Date(endDate));
    }

    const [customers, total] = await this.customerRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      message: 'Customers retrieved successfully!',
      data: customers,
      pagination: {
        pageNumber: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasPreviousPage: page > 1,
        hasNextPage: total > page * limit,
      },
    };
  }

  async findOne(uuid: string) {
    const customer = await this.getCustomerByUuid(uuid);
    return {
      success: true,
      message: 'Customer found!',
      data: customer,
    };
  }

  async update(uuid: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.getCustomerByUuid(uuid);
    this.customerRepository.merge(customer, updateCustomerDto);

    try {
      const updatedCustomer = await this.customerRepository.save(customer);
      return {
        success: true,
        message: 'Customer updated successfully!',
        data: updatedCustomer,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(uuid: string) {
    const customer = await this.getCustomerByUuid(uuid);
    await this.customerRepository.softRemove(customer);

    return {
      success: true,
      message: 'Customer and related addresses deleted successfully!',
      data: customer,
    };
  }

  async getCustomerByUuid(uuid: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with uuid ${uuid} not found!`);
    }

    return customer;
  }

  private ensureSinglePrimaryAddress(addresses: CreateAddressDto[]) {
    const primaryAddresses = addresses.filter((addr) => addr.is_primary).length;

    if (primaryAddresses > 1) {
      throw new BadRequestException('Only one primary address is allowed.');
    }

    if (primaryAddresses === 0 && addresses.length > 0) {
      addresses[0].is_primary = true;
    }
  }

  private handleDBErrors(error: any): never {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    if (error instanceof QueryFailedError) {
      if ((error as any).errno === 1062) {
        throw new BadRequestException(
          (error as any).detail ||
            (error as any).sqlMessage ||
            'Duplicate entry',
        );
      }
    }

    console.error(error);
    throw new InternalServerErrorException(
      'Server Error. Please contact the system administrator!',
    );
  }
}