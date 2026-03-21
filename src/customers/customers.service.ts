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
import { Address } from 'src/addresses/entities/address.entity';
import {
  SuccessResponseDto,
  PaginatedResponse,
} from 'src/common/dto/success-response.dto';
import { LogsService } from 'src/logs/logs.service';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Customer>> {
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

      await this.logsService.log(currentUser || null, {
        module: LogModule.CUSTOMERS,
        action: LogAction.CREATE,
        entityUuid: savedCustomer.uuid,
        entityName: savedCustomer.name,
        description: `Cliente creado: ${savedCustomer.name}`,
        newData: { name: savedCustomer.name, email: savedCustomer.email },
      });

      return new SuccessResponseDto(
        true,
        'Customer created successfully!',
        savedCustomer,
      );
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(
    queryCustomerDto: QueryCustomerDto,
  ): Promise<PaginatedResponse<Customer>> {
    const { limit = 10, page = 1, startDate, endDate } = queryCustomerDto;

    const where: FindManyOptions<Customer>['where'] = {};

    if (startDate && endDate) {
      where.created_at = Between(new Date(startDate), new Date(endDate));
    }

    const [customers, total] = await this.customerRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
    });

    return PaginatedResponse.create(
      customers,
      total,
      page,
      limit,
      'Customers retrieved successfully!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Customer>> {
    const customer = await this.getCustomerByUuid(uuid);
    return new SuccessResponseDto(true, 'Customer found!', customer);
  }

  async update(
    uuid: string,
    updateCustomerDto: UpdateCustomerDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Customer>> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
      relations: { addresses: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with uuid ${uuid} not found!`);
    }

    const oldData = { ...customer };
    const { addresses, ...customerData } = updateCustomerDto;

    this.customerRepository.merge(customer, customerData);

    if (addresses !== undefined) {
      this.ensureSinglePrimaryAddress(addresses);

      const existingAddressesMap = new Map(
        customer.addresses.map((address) => [address.uuid, address]),
      );

      const processedAddresses: Address[] = [];

      for (const addressDto of addresses) {
        if (addressDto.uuid) {
          const existingAddress = existingAddressesMap.get(addressDto.uuid);

          if (existingAddress) {
            this.addressRepository.merge(existingAddress, addressDto);
            existingAddress.customer = customer;
            processedAddresses.push(existingAddress);
            existingAddressesMap.delete(addressDto.uuid);
          } else {
            throw new BadRequestException(
              `Address with uuid ${addressDto.uuid} not found for this customer.`,
            );
          }
        } else {
          const newAddress = this.addressRepository.create({
            ...addressDto,
            customer,
          });

          processedAddresses.push(newAddress);
        }
      }

      await this.addressRepository.save(processedAddresses);
    }

    try {
      await this.customerRepository.save(customer);

      await this.logsService.log(currentUser || null, {
        module: LogModule.CUSTOMERS,
        action: LogAction.UPDATE,
        entityUuid: customer.uuid,
        entityName: customer.name,
        description: `Cliente actualizado: ${customer.name}`,
        oldData,
        newData: updateCustomerDto,
      });

      return new SuccessResponseDto(
        true,
        'Customer updated successfully!',
        await this.getCustomerByUuid(uuid),
      );
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Customer>> {
    const customer = await this.getCustomerByUuid(uuid);
    await this.customerRepository.softRemove(customer);

    await this.logsService.log(currentUser || null, {
      module: LogModule.CUSTOMERS,
      action: LogAction.DELETE,
      entityUuid: customer.uuid,
      entityName: customer.name,
      description: `Cliente eliminado: ${customer.name}`,
      oldData: { name: customer.name, email: customer.email },
    });

    return new SuccessResponseDto(
      true,
      'Customer and related addresses deleted successfully!',
      customer,
    );
  }

  async getCustomerByUuid(uuid: string): Promise<Customer> {
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect(
        'customer.addresses',
        'address',
        'address.is_active = :isActive AND address.deleted_at IS NULL',
        { isActive: true },
      )
      .where('customer.uuid = :uuid', { uuid })
      .getOne();
    if (!customer) {
      throw new NotFoundException(`Customer with uuid ${uuid} not found!`);
    }

    return customer;
  }

  private ensureSinglePrimaryAddress(
    addresses: Array<{ is_primary?: boolean }>,
  ) {
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
