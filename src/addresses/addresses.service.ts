import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  InjectRepository
} from '@nestjs/typeorm';
import {
  Repository,
  QueryFailedError,
  Not
} from 'typeorm';
import {
  Address
} from './entities/address.entity';
import {
  CreateAddressDto
} from './dto/create-address.dto';
import {
  UpdateAddressDto
} from './dto/update-address.dto';
import {
  ClientsService
} from 'src/clients/clients.service';

@Injectable()
export class AddressesService {

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository < Address > ,
    private readonly clientsService: ClientsService,
  ) {}

  async addAddressToClient(clientUuid: string, createAddressDto: CreateAddressDto) {
    const client = await this.clientsService.getClientByUuid(clientUuid);

    if (createAddressDto.is_primary) {
      await this.unsetCurrentPrimaryAddress(client.id);
    }

    const newAddress = this.addressRepository.create({
      ...createAddressDto,
      client: client,
    });

    try {
      const savedAddress = await this.addressRepository.save(newAddress);
      return {
        success: true,
        message: 'Address added successfully!',
        data: savedAddress,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async update(uuid: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.getAddressByUuid(uuid);

    if (updateAddressDto.is_primary) {
      await this.unsetCurrentPrimaryAddress(address.client.id, address.id);
    }

    this.addressRepository.merge(address, updateAddressDto);
    try {
      const updatedAddress = await this.addressRepository.save(address);
      return {
        success: true,
        message: 'Address updated successfully!',
        data: updatedAddress,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(uuid: string) {
    const address = await this.getAddressByUuid(uuid);
    await this.addressRepository.softDelete({
      uuid
    });
    return {
      success: true,
      message: 'Address deleted successfully!',
      data: address,
    };
  }

  async findOne(uuid: string) {
    const address = await this.getAddressByUuid(uuid);
    return {
      success: true,
      message: 'Address found!',
      data: address,
    };
  }

  private async getAddressByUuid(uuid: string): Promise < Address > {
    const address = await this.addressRepository.findOne({
      where: {
        uuid
      },
      relations: ['client'],
    });
    if (!address) {
      throw new NotFoundException(`Address with uuid ${uuid} not found!`);
    }
    return address;
  }

  private async unsetCurrentPrimaryAddress(clientId: number, newPrimaryAddressId ? : number) {
    const whereClause: any = {
      client: {
        id: clientId
      },
      is_primary: true,
    };

    if (newPrimaryAddressId) {
      whereClause.id = Not(newPrimaryAddressId);
    }

    const currentPrimary = await this.addressRepository.findOne({
      where: whereClause
    });

    if (currentPrimary) {
      currentPrimary.is_primary = false;
      await this.addressRepository.save(currentPrimary);
    }
  }

  private handleDBErrors(error: any): never {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof QueryFailedError) {
      if ((error as any).errno === 1062) {
        throw new BadRequestException((error as any).detail || (error as any).sqlMessage || 'Duplicate entry');
      }
    }

    console.error(error);
    throw new InternalServerErrorException('Server Error. Please contact the system administrator!');
  }
}