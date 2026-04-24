import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDeliveryDriverDto } from './dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from './dto/update-delivery-driver.dto';
import { DeliveryDriver } from './entities/delivery-driver.entity';

import { PaginationDto } from '../common/dto/pagination.dto';
import {
  SuccessResponseDto,
  PaginatedResponse,
} from '../common/dto/success-response.dto';

import { LogsService } from 'src/logs/logs.service';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogAction } from 'src/logs/enums/log-action.enum';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

import { DeliveryCatalog } from 'src/delivery-catalogs/entities/delivery-catalog.entity';

const DRIVER_CATALOG_CATEGORIES = [
  'driver_profile',
  'driver_type',
  'license_type',
  'document_type',
  'driver_status',
  'vehicle_type',
  'vehicle_status',
] as const;

const DEFAULT_DELIVERY_ROLE_CODE = 'DELIVERY';

@Injectable()
export class DeliveryDriversService {
  constructor(
    @InjectRepository(DeliveryDriver)
    private readonly deliveryDriverRepository: Repository<DeliveryDriver>,

    @InjectRepository(DeliveryCatalog)
    private readonly deliveryCatalogRepository: Repository<DeliveryCatalog>,

    private readonly logsService: LogsService,

    private readonly usersService: UsersService,
  ) { }

  async create(
    createDeliveryDriverDto: CreateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const user = await this.validateUser(createDeliveryDriverDto.user_uuid);

    await this.validateUserDeliveryAssignment(
      user.id
    );

    const savedDriver = await this.deliveryDriverRepository.save(
      this.deliveryDriverRepository.create(createDeliveryDriverDto),
    );

    const createdDriver = await this.getDriverByUuid(savedDriver.uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.CREATE,
      entityUuid: savedDriver.uuid,
      entityName: `Driver ${savedDriver.uuid}`,
      description: `Repartidor creado con user id: ${savedDriver.user_id}`,
      newData:{...createdDriver},
    });

    return new SuccessResponseDto(
      true,
      'Repartidor creado exitosamente!',
      createdDriver,
    );
  }

  async getCatalogs(
    type?: string,
  ): Promise<SuccessResponseDto<Record<string, DeliveryCatalog[]>>> {
    const result = await this.buildCatalogResponse(type);

    return new SuccessResponseDto(
      true,
      'Catálogos obtenidos exitosamente!',
      result,
    );
  }

  async buildCatalogResponse(
    type?: string,
  ): Promise<Record<string, DeliveryCatalog[]>> {
    const cleanType = type?.trim();

    const catalogItems = await this.deliveryCatalogRepository.find({
      where: {
        is_active: true,
        category: cleanType,
      },
      order: {
        category: 'ASC',
        sort_order: 'ASC',
        name: 'ASC',
      },
    });

    const catalogs: Record<string, DeliveryCatalog[]> = {};

    for (const item of catalogItems) {
      if (!catalogs[item.category]) {
        catalogs[item.category] = [];
      }

      catalogs[item.category].push(item);
    }

    return catalogs;
  }


  async findAll(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResponse<DeliveryDriver>> {
    const { limit = 10, page = 1 } = paginationDto || {};

    const [drivers, total] = await this.deliveryDriverRepository.findAndCount({
      relations: ['user', 'vehicles'],
      order: {
        created_at: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return PaginatedResponse.create(
      drivers,
      total,
      page,
      limit,
      'Repartidores obtenidos exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driver = await this.getDriverByUuid(uuid);

    return new SuccessResponseDto(
      true,
      'Repartidor encontrado!',
      driver,
    );
  }

  async update(
    uuid: string,
    updateDeliveryDriverDto: UpdateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driverToUpdate = await this.getDriverByUuid(uuid);
    const oldData = {...driverToUpdate};
    if (updateDeliveryDriverDto.user_uuid) {
      const user = await this.validateUser(updateDeliveryDriverDto.user_uuid);

      await this.validateUserDeliveryAssignment(
        user.id,
        driverToUpdate.uuid,
      );
    }

    Object.assign(driverToUpdate, updateDeliveryDriverDto);

    await this.deliveryDriverRepository.save(driverToUpdate);

    const updatedDriver = await this.getDriverByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.UPDATE,
      entityUuid: updatedDriver.uuid,
      entityName: `Driver ${updatedDriver.uuid}`,
      description: `Repartidor actualizado: ${updatedDriver.uuid}`,
      oldData,
      newData: updateDeliveryDriverDto,
    });

    return new SuccessResponseDto(
      true,
      'Repartidor actualizado exitosamente!',
      updatedDriver,
    );
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driver = await this.getDriverByUuid(uuid);

    await this.deliveryDriverRepository.softDelete({ uuid });

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.DELETE,
      entityUuid: driver.uuid,
      entityName: `Driver ${driver.uuid}`,
      description: `Repartidor eliminado: ${driver.uuid}`,
      oldData: {...driver},
    });

    return new SuccessResponseDto(
      true,
      'Repartidor eliminado exitosamente!',
      driver,
    );
  }

  private async getDriverByUuid(uuid: string): Promise<DeliveryDriver> {
    const driver = await this.deliveryDriverRepository.findOne({
      where: { uuid },
      relations: ['user', 'vehicles'],
    });

    if (!driver) {
      throw new NotFoundException(
        `Repartidor con uuid ${uuid} no encontrado!`,
      );
    }

    return driver;
  }

  private async validateUser(uuid: string): Promise<User> {
    const result = await this.usersService.findOne(uuid);
    const user = result.data;
    const hasDeliveryRole = user.roles?.some(
      (role) =>
        role.code === DEFAULT_DELIVERY_ROLE_CODE &&
        role.is_active === true,
    );
    if (!hasDeliveryRole) {
      throw new BadRequestException(
        'El usuario seleccionado no tiene rol de delivery',
      );
    }

    return user;
  }

  private async validateUserDeliveryAssignment(
    userId: number,
    excludeDeliveryUuid?: string,
  ): Promise<void> {
    const existingDelivery = await this.deliveryDriverRepository.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!existingDelivery) {
      return;
    }

    if (excludeDeliveryUuid && existingDelivery.uuid === excludeDeliveryUuid) { return; }

    throw new BadRequestException('El usuario seleccionado ya tiene un delivery asignado',
    );
  }
}