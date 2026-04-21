import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { DeliveryDriver } from 'src/delivery-drivers/entities/delivery-driver.entity';
import { LogsService } from 'src/logs/logs.service';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { User } from 'src/users/entities/user.entity';
import { CreateDeliveryVehicleDto } from './dto/create-delivery-vehicle.dto';
import { QueryDeliveryVehicleDto } from './dto/query-delivery-vehicle.dto';
import { UpdateDeliveryVehicleDto } from './dto/update-delivery-vehicle.dto';
import { DeliveryVehicle } from './entities/delivery-vehicle.entity';

@Injectable()
export class DeliveryVehiclesService {
  constructor(
    @InjectRepository(DeliveryVehicle)
    private readonly deliveryVehicleRepository: Repository<DeliveryVehicle>,
    @InjectRepository(DeliveryDriver)
    private readonly deliveryDriverRepository: Repository<DeliveryDriver>,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createDeliveryVehicleDto: CreateDeliveryVehicleDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryVehicle>> {
    const { delivery_driver_uuid, ...vehicleData } = createDeliveryVehicleDto;
    const driver = await this.getDriverByUuid(delivery_driver_uuid);

    const isPrimary = await this.resolvePrimaryFlag(
      driver.id,
      createDeliveryVehicleDto.is_primary,
    );

    if (isPrimary) {
      await this.clearPrimaryVehicles(driver.id);
    }

    const vehicle = this.deliveryVehicleRepository.create({
      ...vehicleData,
      delivery_driver_id: driver.id,
      is_primary: isPrimary,
      status: vehicleData.status ?? 'active',
    });

    const savedVehicle = await this.deliveryVehicleRepository.save(vehicle);
    const createdVehicle = await this.getVehicleByUuid(savedVehicle.uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_VEHICLES,
      action: LogAction.CREATE,
      entityUuid: createdVehicle.uuid,
      entityName: createdVehicle.plate_number,
      description: `Vehiculo de reparto creado: ${createdVehicle.plate_number}`,
      newData: {
        plate_number: createdVehicle.plate_number,
        vehicle_type: createdVehicle.vehicle_type,
        delivery_driver_uuid,
      },
    });

    return new SuccessResponseDto(
      true,
      'Vehiculo de reparto creado exitosamente!',
      createdVehicle,
    );
  }

  async findAll(
    queryDto: QueryDeliveryVehicleDto,
  ): Promise<PaginatedResponse<DeliveryVehicle>> {
    const { limit = 10, page = 1, delivery_driver_uuid } = queryDto;

    const query = this.deliveryVehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.delivery_driver', 'driver')
      .leftJoinAndSelect('driver.user', 'user')
      .orderBy('vehicle.created_at', 'DESC');

    if (delivery_driver_uuid) {
      query.andWhere('driver.uuid = :delivery_driver_uuid', {
        delivery_driver_uuid,
      });
    }

    const [vehicles, total] = await query
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return PaginatedResponse.create(
      vehicles,
      total,
      page,
      limit,
      'Vehiculos de reparto obtenidos exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<DeliveryVehicle>> {
    const vehicle = await this.getVehicleByUuid(uuid);

    return new SuccessResponseDto(
      true,
      'Vehiculo de reparto encontrado!',
      vehicle,
    );
  }

  async update(
    uuid: string,
    updateDeliveryVehicleDto: UpdateDeliveryVehicleDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryVehicle>> {
    const vehicle = await this.getVehicleByUuid(uuid);
    const oldData = { ...vehicle };
    const oldDriverId = vehicle.delivery_driver_id;

    let targetDriverId = vehicle.delivery_driver_id;

    if (updateDeliveryVehicleDto.delivery_driver_uuid) {
      const nextDriver = await this.getDriverByUuid(
        updateDeliveryVehicleDto.delivery_driver_uuid,
      );
      targetDriverId = nextDriver.id;
    }

    const isPrimary = await this.resolvePrimaryFlag(
      targetDriverId,
      updateDeliveryVehicleDto.is_primary,
      vehicle,
    );

    if (isPrimary) {
      await this.clearPrimaryVehicles(targetDriverId, vehicle.id);
    }

    Object.assign(vehicle, updateDeliveryVehicleDto, {
      delivery_driver_id: targetDriverId,
      is_primary: isPrimary,
    });

    await this.deliveryVehicleRepository.save(vehicle);

    if (oldDriverId !== targetDriverId || oldData.is_primary) {
      await this.assignPrimaryVehicleIfNeeded(oldDriverId);
    }

    const updatedVehicle = await this.getVehicleByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_VEHICLES,
      action: LogAction.UPDATE,
      entityUuid: updatedVehicle.uuid,
      entityName: updatedVehicle.plate_number,
      description: `Vehiculo de reparto actualizado: ${updatedVehicle.plate_number}`,
      oldData,
      newData: updateDeliveryVehicleDto,
    });

    return new SuccessResponseDto(
      true,
      'Vehiculo de reparto actualizado exitosamente!',
      updatedVehicle,
    );
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryVehicle>> {
    const vehicle = await this.getVehicleByUuid(uuid);

    await this.deliveryVehicleRepository.softDelete({ uuid });
    await this.assignPrimaryVehicleIfNeeded(vehicle.delivery_driver_id);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_VEHICLES,
      action: LogAction.DELETE,
      entityUuid: vehicle.uuid,
      entityName: vehicle.plate_number,
      description: `Vehiculo de reparto eliminado: ${vehicle.plate_number}`,
      oldData: {
        plate_number: vehicle.plate_number,
        delivery_driver_uuid: vehicle.delivery_driver.uuid,
      },
    });

    return new SuccessResponseDto(
      true,
      'Vehiculo de reparto eliminado exitosamente!',
      vehicle,
    );
  }

  private async getVehicleByUuid(uuid: string): Promise<DeliveryVehicle> {
    const vehicle = await this.deliveryVehicleRepository.findOne({
      where: { uuid },
      relations: ['delivery_driver', 'delivery_driver.user'],
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Vehiculo de reparto con uuid ${uuid} no encontrado!`,
      );
    }

    return vehicle;
  }

  private async getDriverByUuid(uuid: string): Promise<DeliveryDriver> {
    const driver = await this.deliveryDriverRepository.findOne({
      where: { uuid },
    });

    if (!driver) {
      throw new NotFoundException(`Repartidor con uuid ${uuid} no encontrado!`);
    }

    return driver;
  }

  private async resolvePrimaryFlag(
    deliveryDriverId: number,
    requestedPrimary?: boolean,
    currentVehicle?: DeliveryVehicle,
  ): Promise<boolean> {
    const countQuery = this.deliveryVehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.delivery_driver_id = :deliveryDriverId', {
        deliveryDriverId,
      })
      .andWhere('vehicle.deleted_at IS NULL');

    if (currentVehicle) {
      countQuery.andWhere('vehicle.id != :vehicleId', {
        vehicleId: currentVehicle.id,
      });
    }

    const otherVehiclesCount = await countQuery.getCount();

    if (requestedPrimary === true) {
      return true;
    }

    if (requestedPrimary === false) {
      return otherVehiclesCount === 0;
    }

    if (currentVehicle && currentVehicle.delivery_driver_id === deliveryDriverId) {
      return currentVehicle.is_primary;
    }

    return otherVehiclesCount === 0;
  }

  private async clearPrimaryVehicles(
    deliveryDriverId: number,
    excludeVehicleId?: number,
  ): Promise<void> {
    const query = this.deliveryVehicleRepository
      .createQueryBuilder()
      .update(DeliveryVehicle)
      .set({ is_primary: false })
      .where('delivery_driver_id = :deliveryDriverId', { deliveryDriverId })
      .andWhere('deleted_at IS NULL');

    if (excludeVehicleId) {
      query.andWhere('id != :excludeVehicleId', { excludeVehicleId });
    }

    await query.execute();
  }

  private async assignPrimaryVehicleIfNeeded(
    deliveryDriverId: number,
  ): Promise<void> {
    const currentPrimary = await this.deliveryVehicleRepository.findOne({
      where: {
        delivery_driver_id: deliveryDriverId,
        is_primary: true,
      },
    });

    if (currentPrimary) {
      return;
    }

    const nextPrimary = await this.deliveryVehicleRepository.findOne({
      where: { delivery_driver_id: deliveryDriverId },
      order: { created_at: 'ASC' },
    });

    if (!nextPrimary) {
      return;
    }

    nextPrimary.is_primary = true;
    await this.deliveryVehicleRepository.save(nextPrimary);
  }
}
