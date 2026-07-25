import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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

import { DeliveryCatalog } from 'src/delivery-catalogs/entities/delivery-catalog.entity';
import { DeliveryDriversRepository } from './repositories/delivery-drivers.repository';
import { DeliveryCatalogsRepository } from 'src/delivery-catalogs/repositories/delivery-catalogs.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { NotificationsService } from 'src/notifications/notifications.service';
import { SendDeliveryDriverInvitationDto } from './dto/send-delivery-driver-invitation.dto';
import { LicenseValidationService } from 'src/auth/services/license-validation.service';

const DEFAULT_DELIVERY_ROLE_CODE = 'DELIVERY';
const DEFAULT_DELIVERY_INVITATION_NOTIFICATION_CODE = 'DELIVERY_DRIVER_INVITATION';
@Injectable()
export class DeliveryDriversService {
  constructor(
    private readonly deliveryDriversRepository: DeliveryDriversRepository,

    private readonly deliveryCatalogsRepository: DeliveryCatalogsRepository,

    private readonly logsService: LogsService,

    private readonly usersRepository: UsersRepository,

    private readonly notificationsService: NotificationsService,

    private readonly licenseValidationService: LicenseValidationService,
  ) {}

  async create(
    createDeliveryDriverDto: CreateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const { user_uuid, license_expiration, ...driverData } =
      createDeliveryDriverDto;
    const user = user_uuid ? await this.validateUser(user_uuid) : null;

    if (user) {
      await this.validateUserDeliveryAssignment(user.id);
    }

    const savedDriver = await this.deliveryDriversRepository.save(
      this.deliveryDriversRepository.create({
        ...driverData,
        user_id: user?.id ?? null,
        license_expiration: license_expiration
          ? String(license_expiration).split('T')[0]
          : undefined,
      }),
    );

    const createdDriver = await this.getDriverByUuid(savedDriver.uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.CREATE,
      entityUuid: savedDriver.uuid,
      entityName: `Driver ${savedDriver.uuid}`,
      description: `Repartidor creado con user id: ${savedDriver.user_id}`,
      newData: { ...createdDriver },
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

    const catalogItems =
      await this.deliveryCatalogsRepository.findActiveByCategory(cleanType);

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

    const [drivers, total] =
      await this.deliveryDriversRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      drivers,
      total,
      page,
      limit,
      'Repartidores obtenidos exitosamente!',
    );
  }

  async getUsersForDeliveryDrivers() {
    const users = await this.usersRepository.findByRoleCode(
      DEFAULT_DELIVERY_ROLE_CODE,
    );
    return new SuccessResponseDto(
      true,
      'Usuarios obtenidos exitosamente!',
      users,
    );
  }

  async sendInvitation(sendInvitationDto: SendDeliveryDriverInvitationDto) {
    const license = await this.licenseValidationService.validate();
    const user = await this.usersRepository.findByUuid(
      sendInvitationDto.user_uuid,
    );

    if (!user) {
      throw new NotFoundException('El usuario seleccionado no existe');
    }

    const driver = await this.deliveryDriversRepository.findByUserId(user.id);

    if (!driver) {
      throw new NotFoundException(
        'El usuario seleccionado no tiene un repartidor con teléfono asignado',
      );
    }

    const parameters = {
      param0: [user.name, user.last_name].filter(Boolean).join(' ') || user.username,
      param1: license.data.activation_code,
    };

    const result = await this.notificationsService.sendNotification(
      DEFAULT_DELIVERY_INVITATION_NOTIFICATION_CODE,
      driver.country_code,
      driver.phone,
      parameters,
    );

    return new SuccessResponseDto(true, 'Invitación enviada exitosamente!', {
      notification_uuid: result.notification.uuid,
      user_uuid: user.uuid,
      to: driver.phone,
      provider_response: result.response,
    });
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driver = await this.getDriverByUuid(uuid);

    return new SuccessResponseDto(true, 'Repartidor encontrado!', driver);
  }

  async update(
    uuid: string,
    updateDeliveryDriverDto: UpdateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driverToUpdate = await this.getDriverByUuid(uuid);
    const oldData = { ...driverToUpdate };
    const { user_uuid, license_expiration, ...driverData } =
      updateDeliveryDriverDto;
    const updateData: Partial<DeliveryDriver> = {
      ...driverData,
      ...(license_expiration
        ? { license_expiration: new Date(license_expiration) }
        : {}),
    };
    if (user_uuid === null) {
      updateData.user_id = null;
    } else if (user_uuid) {
      const user = await this.validateUser(user_uuid);
      if (!user)
        throw new BadRequestException('El usuario seleccionado no es válido');
      await this.validateUserDeliveryAssignment(user.id, driverToUpdate.uuid);
      updateData.user_id = user.id;
    }

    Object.assign(driverToUpdate, updateData);

    await this.deliveryDriversRepository.save(driverToUpdate);

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

    await this.deliveryDriversRepository.softDeleteByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.DELETE,
      entityUuid: driver.uuid,
      entityName: `Driver ${driver.uuid}`,
      description: `Repartidor eliminado: ${driver.uuid}`,
      oldData: { ...driver },
    });

    return new SuccessResponseDto(
      true,
      'Repartidor eliminado exitosamente!',
      driver,
    );
  }

  private async getDriverByUuid(uuid: string): Promise<DeliveryDriver> {
    const driver = await this.deliveryDriversRepository.findByUuid(uuid);

    if (!driver) {
      throw new NotFoundException(`Repartidor con uuid ${uuid} no encontrado!`);
    }

    return driver;
  }

  private async validateUser(uuid: string): Promise<User | null> {
    const user = await this.usersRepository.findByUuid(uuid);
    const hasDeliveryRole = user?.roles?.some(
      (role) =>
        role.code === DEFAULT_DELIVERY_ROLE_CODE && role.is_active === true,
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
    const existingDelivery =
      await this.deliveryDriversRepository.findByUserId(userId);

    if (!existingDelivery) {
      return;
    }

    if (excludeDeliveryUuid && existingDelivery.uuid === excludeDeliveryUuid) {
      return;
    }

    throw new BadRequestException(
      'El usuario seleccionado ya tiene un delivery asignado',
    );
  }

 
}
