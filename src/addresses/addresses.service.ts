import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CustomersService } from 'src/customers/customers.service';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { LogsService } from 'src/logs/logs.service';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { User } from 'src/users/entities/user.entity';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { AddressesRepository } from './repositories/addresses.repository';

@Injectable()
export class AddressesService {
  constructor(
    private readonly addressesRepository: AddressesRepository,
    private readonly customersService: CustomersService,
    private readonly logsService: LogsService,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) {}

  async addAddressToCustomer(
    customerUuid: string,
    createAddressDto: CreateAddressDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Address>> {
    const customer =
      await this.customersService.getCustomerByUuid(customerUuid);

    if (createAddressDto.is_primary) {
      await this.unsetCurrentPrimaryAddress(customer.id);
    }

    const newAddress = this.addressesRepository.create({
      ...createAddressDto,
      customer: customer,
    });

    try {
      const savedAddress = await this.addressesRepository.save(newAddress);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ADDRESSES,
        action: LogAction.CREATE,
        entityUuid: savedAddress.uuid,
        entityName: `Address for ${customer.name}`,
        description: `Dirección agregada al cliente: ${customer.name}`,
        newData: { street: savedAddress.street, customerUuid },
      });

      return new SuccessResponseDto(
        true,
        'Address added successfully!',
        savedAddress,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async update(
    uuid: string,
    updateAddressDto: UpdateAddressDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Address>> {
    const address = await this.getAddressByUuid(uuid);

    if (updateAddressDto.is_primary) {
      if (!address.customer) {
        throw new BadRequestException('Address has no customer assigned.');
      }

      await this.unsetCurrentPrimaryAddress(address.customer.id, address.id);
    }

    const oldData = { ...address };
    this.addressesRepository.merge(address, updateAddressDto);

    try {
      const updatedAddress = await this.addressesRepository.save(address);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ADDRESSES,
        action: LogAction.UPDATE,
        entityUuid: updatedAddress.uuid,
        entityName: `Address ${updatedAddress.street}`,
        description: `Dirección actualizada`,
        oldData,
        newData: updateAddressDto,
      });

      return new SuccessResponseDto(
        true,
        'Address updated successfully!',
        updatedAddress,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Address>> {
    const address = await this.getAddressByUuid(uuid);
    await this.addressesRepository.softDeleteByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.ADDRESSES,
      action: LogAction.DELETE,
      entityUuid: address.uuid,
      entityName: `Address ${address.street}`,
      description: `Dirección eliminada`,
      oldData: { street: address.street },
    });

    return new SuccessResponseDto(
      true,
      'Address deleted successfully!',
      address,
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Address>> {
    const address = await this.getAddressByUuid(uuid);
    return new SuccessResponseDto(true, 'Address found!', address);
  }

  private async getAddressByUuid(uuid: string): Promise<Address> {
    const address = await this.addressesRepository.findByUuid(uuid);

    if (!address) {
      throw new NotFoundException(`Address with uuid ${uuid} not found!`);
    }

    return address;
  }

  private async unsetCurrentPrimaryAddress(
    customerId: number,
    newPrimaryAddressId?: number,
  ) {
    const currentPrimary =
      await this.addressesRepository.findPrimaryByCustomerId(
        customerId,
        newPrimaryAddressId,
      );

    if (currentPrimary) {
      currentPrimary.is_primary = false;
      await this.addressesRepository.save(currentPrimary);
    }
  }
}
