import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateImportCustomerDto } from './dto/create-import-customer.dto';
import { ImportCustomersDto } from './dto/import-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
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
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
      const customerToLog = await this.getCustomerByUuid(savedCustomer.uuid);

      await this.logsService.log(currentUser || null, {
        module: LogModule.CUSTOMERS,
        action: LogAction.CREATE,
        description: `Cliente creado: ${customerToLog.name}. UUID: ${savedCustomer.uuid}`,
        newData: this.getCustomerAuditData(customerToLog),
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

  async import(
    importCustomersDto: ImportCustomersDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Customer[]>> {
    const customersByCode = new Map<string, CreateImportCustomerDto[]>();
    for (const customer of importCustomersDto.customers) {
      customer.code = customer.code.trim().toUpperCase();
      if (customer.email) customer.email = customer.email.trim().toLowerCase();
      customersByCode.set(customer.code, [
        ...(customersByCode.get(customer.code) ?? []),
        customer,
      ]);
    }

    const codes = [...customersByCode.keys()];
    const existingCustomers = await this.customersRepository.findByCodes(codes);
    const existingCustomersByCode = new Map(
      existingCustomers.map((customer) => [customer.code, customer]),
    );
    const customersToCreate: Array<{
      code: string;
      name: string;
      email: string;
      phone?: string | null;
      addresses: ReturnType<CustomersService['getImportAddress']>[];
    }> = [];
    const addressesToAdd: Array<ReturnType<CustomersService['getImportAddress']> & {
      customer_id: number;
    }> = [];

    for (const [code, rows] of customersByCode) {
      const addresses = rows.map((row) => this.getImportAddress(row));
      const existingCustomer = existingCustomersByCode.get(code);

      if (existingCustomer) {
        this.ensureAtMostOnePrimaryAddress(addresses);
        addressesToAdd.push(
          ...addresses.map((address) => ({
            ...address,
            customer_id: existingCustomer.id,
          })),
        );
        continue;
      }

      const customerData = rows.find((row) => row.name && row.email);
      if (!customerData) {
        throw new BadRequestException(
          `El cliente con código ${code} requiere nombre y correo para crearlo.`,
        );
      }

      const name = customerData.name?.trim();
      const email = customerData.email?.trim().toLowerCase();
      if (!name || !email) {
        throw new BadRequestException(
          `El cliente con código ${code} requiere nombre y correo para crearlo.`,
        );
      }

      this.ensureSinglePrimaryAddress(addresses);
      customersToCreate.push({
        code,
        name,
        email,
        phone: customerData.phone?.trim() || null,
        addresses,
      });
    }

    const emails = customersToCreate.map((customer) => customer.email);
    const duplicatedEmails = emails.filter(
      (email, index) => emails.indexOf(email) !== index,
    );
    if (duplicatedEmails.length) {
      throw new BadRequestException(
        `Hay correos de cliente duplicados en la carga: ${[...new Set(duplicatedEmails)].join(', ')}.`,
      );
    }

    const existingCustomersByEmail = await this.customersRepository.findByEmails(
      emails,
    );
    if (existingCustomersByEmail.length) {
      throw new BadRequestException(
        `Ya existen clientes con los correos: ${existingCustomersByEmail.map((customer) => customer.email).join(', ')}.`,
      );
    }

    try {
      const savedCustomers = await this.customersRepository.importMany(
        customersToCreate,
        addressesToAdd,
      );
      const affectedCustomers = [...savedCustomers, ...existingCustomers];

      await this.logsService.log(currentUser || null, {
        module: LogModule.CUSTOMERS,
        action: LogAction.CREATE,
        description: `Carga masiva de clientes: ${savedCustomers.length} clientes creados y ${addressesToAdd.length} direcciones agregadas.`,
        newData: {
          created_customers: savedCustomers.length,
          added_addresses: addressesToAdd.length,
          codes,
        },
      });

      return new SuccessResponseDto(
        true,
        'Clientes y direcciones cargados exitosamente!',
        affectedCustomers,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  getImportTemplate(): SuccessResponseDto<{
    customers: CreateImportCustomerDto[];
  }> {
    return new SuccessResponseDto(
      true,
      'Plantilla de clientes obtenida exitosamente!',
      {
        customers: [
          {
            code: 'CLI-001',
            name: 'Cliente Ejemplo',
            email: 'contacto@example.com',
            phone: '5551234567',
            street: 'Avenida Reforma',
            external_number: '123',
            internal_number: '12',
            neighborhood: 'Juárez',
            district: 'Cuauhtémoc',
            city: 'Ciudad de México',
            state: 'Ciudad de México',
            country: 'México',
            postal_code: '06600',
            reference: 'Acceso principal',
            latitude: 19.427,
            longitude: -99.1677,
            is_primary: true,
          },
          {
            code: 'CLI-001',
            street: 'Avenida Insurgentes',
            external_number: '456',
            internal_number: '3',
            neighborhood: 'Roma Norte',
            district: 'Cuauhtémoc',
            city: 'Ciudad de México',
            state: 'Ciudad de México',
            country: 'México',
            postal_code: '06700',
            reference: 'Entrada por estacionamiento',
            latitude: 19.417,
            longitude: -99.162,
            is_primary: false,
          },
        ],
      },
    );
  }

  async findAll(
   paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Customer>> {
    const { limit = 10, page = 1 } = paginationDto;
    const [customers, total] =
      await this.customersRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      customers,
      total,
      page,
      limit,
      'Customers retrieved successfully!',
    );
  }

  async getCustomerCatalog(): Promise<SuccessResponseDto<Customer[]>> {
      const customers = await this.customersRepository.findActive();
      return new SuccessResponseDto(
        true,
        'Clientes obtenidos exitosamente!',
        customers  ,
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

    const oldData = this.getCustomerAuditData(customer);
    const { addresses, ...customerData } = updateCustomerDto;

    this.customersRepository.merge(customer, customerData);
    await this.customersRepository.save(customer);

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
            customer: { id: customer.id },
          });

          processedAddresses.push(newAddress);
        }
      }

      await this.addressesRepository.saveMany(processedAddresses);

      await Promise.all(
        [...existingAddressesMap.keys()].map((addressUuid) =>
          this.addressesRepository.softDeleteByUuid(addressUuid),
        ),
      );
    }
    try {
      const updatedCustomer = await this.getCustomerByUuid(uuid);

      await this.logsService.log(currentUser || null, {
        module: LogModule.CUSTOMERS,
        action: LogAction.UPDATE,
        description: `Cliente actualizado: ${updatedCustomer.name}. UUID: ${updatedCustomer.uuid}`,
        oldData,
        newData: this.getCustomerAuditData(updatedCustomer),
      });

      return new SuccessResponseDto(
        true,
        'Customer updated successfully!',
        updatedCustomer,
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
      description: `Cliente eliminado: ${customer.name}. UUID: ${customer.uuid}`,
      oldData: this.getCustomerAuditData(customer),
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

  private ensureAtMostOnePrimaryAddress(
    addresses: Array<{ is_primary?: boolean }>,
  ) {
    if (addresses.filter((address) => address.is_primary).length > 1) {
      throw new BadRequestException('Only one primary address is allowed.');
    }
  }

  private getImportAddress(customer: CreateImportCustomerDto) {
    return {
      street: customer.street,
      external_number: customer.external_number,
      internal_number: customer.internal_number,
      neighborhood: customer.neighborhood,
      district: customer.district,
      city: customer.city,
      state: customer.state,
      country: customer.country,
      postal_code: customer.postal_code,
      reference: customer.reference ?? '',
      latitude: customer.latitude,
      longitude: customer.longitude,
      is_primary: customer.is_primary ?? false,
    };
  }

  private getCustomerAuditData(customer: Customer) {
    return {
      code: customer.code,
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? null,
      is_active: customer.is_active,
      addresses: (customer.addresses ?? []).map((address) => ({
        type: address.type ?? null,
        street: address.street,
        external_number: address.external_number ?? null,
        internal_number: address.internal_number ?? null,
        neighborhood: address.neighborhood,
        district: address.district,
        city: address.city,
        state: address.state,
        country: address.country,
        postal_code: address.postal_code,
        reference: address.reference,
        longitude: address.longitude ?? null,
        latitude: address.latitude ?? null,
        is_primary: address.is_primary,
        is_active: address.is_active,
      })),
    };
  }
}
