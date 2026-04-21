import { Injectable, NotFoundException } from '@nestjs/common';
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
import { DELIVERY_CATALOGS } from './constants/delivery-catalogs';

@Injectable()
export class DeliveryDriversService {
  constructor(
    @InjectRepository(DeliveryDriver)
    private readonly deliveryDriverRepository: Repository<DeliveryDriver>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createDeliveryDriverDto: CreateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    await this.validateUser(createDeliveryDriverDto.user_id);

    const driver = this.deliveryDriverRepository.create(
      createDeliveryDriverDto,
    );
    const savedDriver = await this.deliveryDriverRepository.save(driver);
    const createdDriver = await this.getDriverByUuid(savedDriver.uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.CREATE,
      entityUuid: savedDriver.uuid,
      entityName: `Driver ${savedDriver.document_number}`,
      description: `Repartidor creado: ${savedDriver.document_number}`,
      newData: {
        profile: savedDriver.profile,
        driver_type: savedDriver.driver_type,
        document_type: savedDriver.document_type,
        document_number: savedDriver.document_number,
        license_type: savedDriver.license_type,
        phone: savedDriver.phone,
        status: savedDriver.status,
      },
    });

    return new SuccessResponseDto(
      true,
      'Repartidor creado exitosamente!',
      createdDriver,
    );
  }

  getCatalogs() {
    return new SuccessResponseDto(
      true,
      'Catalogos de delivery obtenidos exitosamente!',
      DELIVERY_CATALOGS,
    );
  }

  async findAll(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResponse<DeliveryDriver>> {
    const { limit = 10, page = 1 } = paginationDto || {};

    const [drivers, total] = await this.deliveryDriverRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.user', 'user')
      .leftJoinAndSelect(
        'driver.vehicles',
        'vehicle',
        'vehicle.deleted_at IS NULL',
      )
      .orderBy('driver.created_at', 'DESC')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

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

    return new SuccessResponseDto(true, 'Repartidor encontrado!', driver);
  }

  async update(
    uuid: string,
    updateDeliveryDriverDto: UpdateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driverToUpdate = await this.getDriverByUuid(uuid);

    if (updateDeliveryDriverDto.user_id) {
      await this.validateUser(updateDeliveryDriverDto.user_id);
    }

    const oldData = { ...driverToUpdate };

    Object.assign(driverToUpdate, updateDeliveryDriverDto);
    await this.deliveryDriverRepository.save(driverToUpdate);
    const updatedDriver = await this.getDriverByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.UPDATE,
      entityUuid: updatedDriver.uuid,
      entityName: `Driver ${updatedDriver.document_number}`,
      description: `Repartidor actualizado: ${updatedDriver.document_number}`,
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
      entityName: `Driver ${driver.document_number}`,
      description: `Repartidor eliminado: ${driver.document_number}`,
      oldData: { document_number: driver.document_number },
    });

    return new SuccessResponseDto(
      true,
      'Repartidor eliminado exitosamente!',
      driver,
    );
  }

  private async getDriverByUuid(uuid: string): Promise<DeliveryDriver> {
    const driver = await this.deliveryDriverRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.user', 'user')
      .leftJoinAndSelect(
        'driver.vehicles',
        'vehicle',
        'vehicle.deleted_at IS NULL',
      )
      .where('driver.uuid = :uuid', { uuid })
      .getOne();

    if (!driver) {
      throw new NotFoundException(`Repartidor con uuid ${uuid} no encontrado!`);
    }

    return driver;
  }

  private async validateUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado!`);
    }
  }
}
