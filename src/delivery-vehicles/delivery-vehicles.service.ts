import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { DeliveryDriversRepository } from 'src/delivery-drivers/repositories/delivery-drivers.repository';
import { DeliveryVehiclesRepository } from './repositories/delivery-vehicles.repository';
import { DeliveryCatalogsRepository } from 'src/delivery-catalogs/repositories/delivery-catalogs.repository';

@Injectable()
export class DeliveryVehiclesService {
  constructor(
    private readonly deliveryVehiclesRepository: DeliveryVehiclesRepository,
    private readonly deliveryDriversRepository: DeliveryDriversRepository,
    private readonly deliveryCatalogsRepository: DeliveryCatalogsRepository,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createDeliveryVehicleDto: CreateDeliveryVehicleDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryVehicle>> {
    const { delivery_driver_uuid, ...vehicleData } = createDeliveryVehicleDto;
    const driver = await this.getDriverByUuid(delivery_driver_uuid);
    await this.validateCatalogSelections(createDeliveryVehicleDto);

    const isPrimary = await this.resolvePrimaryFlag(
      driver.id,
      createDeliveryVehicleDto.is_primary,
    );

    if (isPrimary) {
      await this.clearPrimaryVehicles(driver.id);
    }

    const vehicle = this.deliveryVehiclesRepository.create({
      ...vehicleData,
      is_primary: isPrimary,
      status: vehicleData.status ?? 'active',
    });

    const savedVehicle = await this.deliveryVehiclesRepository.save(vehicle);
    await this.deliveryVehiclesRepository.saveAssignment(
      this.deliveryVehiclesRepository.createAssignment({
        delivery_driver_id: driver.id,
        delivery_vehicle_id: savedVehicle.id,
        start_date: new Date(),
        is_active: true,
      }),
    );

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

    const [vehicles, total] =
      await this.deliveryVehiclesRepository.findAll(queryDto);

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
    const oldDriverId = this.getActiveDriverId(vehicle);
    await this.validateCatalogSelections(updateDeliveryVehicleDto);

    let targetDriverId = oldDriverId;
    const { delivery_driver_uuid, ...vehicleDataToUpdate } =
      updateDeliveryVehicleDto;

    if (delivery_driver_uuid) {
      const nextDriver = await this.getDriverByUuid(delivery_driver_uuid);
      targetDriverId = nextDriver.id;

      if (oldDriverId !== targetDriverId) {
        await this.deliveryVehiclesRepository.closeActiveAssignmentsByVehicleId(
          vehicle.id,
        );
        await this.deliveryVehiclesRepository.saveAssignment(
          this.deliveryVehiclesRepository.createAssignment({
            delivery_driver_id: nextDriver.id,
            delivery_vehicle_id: vehicle.id,
            start_date: new Date(),
            is_active: true,
          }),
        );
      }
    }

    const isPrimary = targetDriverId
      ? await this.resolvePrimaryFlag(
          targetDriverId,
          updateDeliveryVehicleDto.is_primary,
          vehicle,
        )
      : false;

    if (isPrimary && targetDriverId) {
      await this.clearPrimaryVehicles(targetDriverId, vehicle.id);
    }

    Object.assign(vehicle, vehicleDataToUpdate, {
      is_primary: isPrimary,
    });

    await this.deliveryVehiclesRepository.save(vehicle);

    if (oldDriverId && (oldDriverId !== targetDriverId || oldData.is_primary)) {
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
    const activeDriverId = this.getActiveDriverId(vehicle);
    const activeDriverUuid = this.getActiveDriverUuid(vehicle);

    await this.deliveryVehiclesRepository.closeActiveAssignmentsByVehicleId(
      vehicle.id,
    );
    await this.deliveryVehiclesRepository.softDeleteByUuid(uuid);
    if (activeDriverId) {
      await this.assignPrimaryVehicleIfNeeded(activeDriverId);
    }

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_VEHICLES,
      action: LogAction.DELETE,
      entityUuid: vehicle.uuid,
      entityName: vehicle.plate_number,
      description: `Vehiculo de reparto eliminado: ${vehicle.plate_number}`,
      oldData: {
        plate_number: vehicle.plate_number,
        delivery_driver_uuid: activeDriverUuid,
      },
    });

    return new SuccessResponseDto(
      true,
      'Vehiculo de reparto eliminado exitosamente!',
      vehicle,
    );
  }

  private async getVehicleByUuid(uuid: string): Promise<DeliveryVehicle> {
    const vehicle = await this.deliveryVehiclesRepository.findByUuid(uuid);

    if (!vehicle) {
      throw new NotFoundException(
        `Vehiculo de reparto con uuid ${uuid} no encontrado!`,
      );
    }

    return vehicle;
  }

  private async getDriverByUuid(uuid: string): Promise<DeliveryDriver> {
    const driver = await this.deliveryDriversRepository.findByUuid(uuid);

    if (!driver) {
      throw new NotFoundException(`Repartidor con uuid ${uuid} no encontrado!`);
    }

    return driver;
  }

  private getActiveDriverId(vehicle: DeliveryVehicle): number | undefined {
    return vehicle.driver_assignments?.find(
      (assignment) => assignment.is_active,
    )?.delivery_driver_id;
  }

  private getActiveDriverUuid(vehicle: DeliveryVehicle): string | undefined {
    return vehicle.driver_assignments?.find(
      (assignment) => assignment.is_active,
    )?.delivery_driver?.uuid;
  }

  private async resolvePrimaryFlag(
    deliveryDriverId: number,
    requestedPrimary?: boolean,
    currentVehicle?: DeliveryVehicle,
  ): Promise<boolean> {
    const otherVehiclesCount =
      await this.deliveryVehiclesRepository.countByDriverId(
        deliveryDriverId,
        currentVehicle?.id,
      );

    if (requestedPrimary === true) {
      return true;
    }

    if (requestedPrimary === false) {
      return otherVehiclesCount === 0;
    }

    if (
      currentVehicle &&
      this.getActiveDriverId(currentVehicle) === deliveryDriverId
    ) {
      return currentVehicle.is_primary;
    }

    return otherVehiclesCount === 0;
  }

  private async clearPrimaryVehicles(
    deliveryDriverId: number,
    excludeVehicleId?: number,
  ): Promise<void> {
    await this.deliveryVehiclesRepository.clearPrimaryByDriverId(
      deliveryDriverId,
      excludeVehicleId,
    );
  }

  private async assignPrimaryVehicleIfNeeded(
    deliveryDriverId: number,
  ): Promise<void> {
    const currentPrimary =
      await this.deliveryVehiclesRepository.findPrimaryByDriverId(
        deliveryDriverId,
      );

    if (currentPrimary) {
      return;
    }

    const nextPrimary =
      await this.deliveryVehiclesRepository.findFirstByDriverId(
        deliveryDriverId,
      );

    if (!nextPrimary) {
      return;
    }

    nextPrimary.is_primary = true;
    await this.deliveryVehiclesRepository.save(nextPrimary);
  }

  private async validateCatalogSelections(
    payload: Partial<CreateDeliveryVehicleDto>,
  ): Promise<void> {
    await this.validateCatalogValue('vehicle_type', payload.vehicle_type);
    await this.validateCatalogValue('vehicle_status', payload.status);
  }

  private async validateCatalogValue(
    category: string,
    code?: string,
  ): Promise<void> {
    if (!code) {
      return;
    }

    const exists = await this.deliveryCatalogsRepository.existsActiveCode(
      category,
      code,
    );

    if (!exists) {
      throw new BadRequestException(
        `El valor ${code} no existe en el catalogo ${category}`,
      );
    }
  }
}
