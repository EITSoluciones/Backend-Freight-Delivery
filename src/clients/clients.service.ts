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
  FindManyOptions,
  Between
} from 'typeorm';
import {
  Client
} from './entities/client.entity';
import {
  CreateClientDto
} from './dto/create-client.dto';
import {
  UpdateClientDto
} from './dto/update-client.dto';
import {
  QueryClientDto
} from './dto/query-client.dto';
import {
  CreateAddressDto
} from 'src/addresses/dto/create-address.dto';

@Injectable()
export class ClientsService {

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository < Client > ,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const {
      addresses,
      ...clientData
    } = createClientDto;

    if (!addresses || addresses.length === 0) {
      throw new BadRequestException('At least one address is required.');
    }

    this.ensureSinglePrimaryAddress(addresses);

    const client = this.clientRepository.create({
      ...clientData,
      addresses: addresses.map(addr => ({ ...addr,
        is_primary: addr.is_primary || false
      })),
    });

    try {
      const savedClient = await this.clientRepository.save(client);
      return {
        success: true,
        message: 'Client created successfully!',
        data: savedClient,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(queryClientDto: QueryClientDto) {
    const {
      limit = 10, page = 1, is_active, startDate, endDate
    } = queryClientDto;
    const offset = (page - 1) * limit;

    const where: FindManyOptions < Client > ['where'] = {};

    // if (is_active !== undefined) {
    //   where.is_active = is_active;
    // }

    if (startDate && endDate) {
      where.created_at = Between(new Date(startDate), new Date(endDate));
    }

    const [clients, total] = await this.clientRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      message: 'Clients retrieved successfully!',
      data: clients,
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
    const client = await this.getClientByUuid(uuid);
    return {
      success: true,
      message: 'Client found!',
      data: client,
    };
  }

  async update(uuid: string, updateClientDto: UpdateClientDto) {
    const client = await this.getClientByUuid(uuid);
    this.clientRepository.merge(client, updateClientDto);
    try {
      const updatedClient = await this.clientRepository.save(client);
      return {
        success: true,
        message: 'Client updated successfully!',
        data: updatedClient,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(uuid: string) {
    const client = await this.getClientByUuid(uuid);
    await this.clientRepository.softRemove(client);
    return {
      success: true,
      message: 'Client and related addresses deleted successfully!',
      data: client,
    };
  }

  async getClientByUuid(uuid: string): Promise < Client > {
    const client = await this.clientRepository.findOne({
      where: {
        uuid
      }
    });
    if (!client) {
      throw new NotFoundException(`Client with uuid ${uuid} not found!`);
    }
    return client;
  }

  private ensureSinglePrimaryAddress(addresses: CreateAddressDto[]) {
    const primaryAddresses = addresses.filter(addr => addr.is_primary).length;
    if (primaryAddresses > 1) {
      throw new BadRequestException('Only one primary address is allowed.');
    }
    if (primaryAddresses === 0 && addresses.length > 0) {
      addresses[0].is_primary = true;
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