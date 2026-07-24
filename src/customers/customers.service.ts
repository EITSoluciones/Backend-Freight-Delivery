import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CustomersRepository } from './repositories/customers.repository';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { AddressesRepository } from 'src/addresses/repositories/addresses.repository';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly addressesRepository: AddressesRepository,
    private readonly logsService: LogsService,
    private readonly dbErrorHandler: DBErrorHandlerService,
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

    const customer = this.customersRepository.create({
      ...customerData,
      addresses: addresses.map((addr) => ({
        ...addr,
        is_primary: addr.is_primary || false,
      })),
    });

    try {
      const savedCustomer = await this.customersRepository.save(customer);

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
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async findAll(
    queryCustomerDto: QueryCustomerDto,
  ): Promise<PaginatedResponse<Customer>> {
    const { limit = 10, page = 1 } = queryCustomerDto;
    const [customers, total] =
      await this.customersRepository.findAll(queryCustomerDto);

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
    const customer = await this.getCustomerByUuidWithAddresses(uuid);

    const oldData = { ...customer };
    const { addresses, ...customerData } = updateCustomerDto;

    this.customersRepository.merge(customer, customerData);

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
            this.addressesRepository.merge(existingAddress, addressDto);
            existingAddress.customer = customer;
            processedAddresses.push(existingAddress);
            existingAddressesMap.delete(addressDto.uuid);
          } else {
            throw new BadRequestException(
              `Address with uuid ${addressDto.uuid} not found for this customer.`,
            );
          }
        } else {
          const newAddress = this.addressesRepository.create({
            ...addressDto,
            customer,
          });

          processedAddresses.push(newAddress);
        }
      }

      await this.addressesRepository.saveMany(processedAddresses);
    }

    try {
      await this.customersRepository.save(customer);

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
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Customer>> {
    const customer = await this.getCustomerByUuid(uuid);
    await this.customersRepository.softRemove(customer);

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
    const customer =
      await this.customersRepository.findByUuidWithActiveAddresses(uuid);

    if (!customer) {
      throw new NotFoundException(`Customer with uuid ${uuid} not found!`);
    }

    return customer;
  }

  private async getCustomerByUuidWithAddresses(
    uuid: string,
  ): Promise<Customer> {
    const customer =
      await this.customersRepository.findByUuidWithAddresses(uuid);

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
}
