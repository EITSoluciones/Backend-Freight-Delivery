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

@Injectable()
export class DeliveryDriversService {
  constructor(
    @InjectRepository(DeliveryDriver)
    private readonly deliveryDriverRepository: Repository<DeliveryDriver>,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createDeliveryDriverDto: CreateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driver = this.deliveryDriverRepository.create(
      createDeliveryDriverDto,
    );
    const savedDriver = await this.deliveryDriverRepository.save(driver);

    await this.logsService.log(currentUser || null, {
      module: LogModule.DELIVERY_DRIVERS,
      action: LogAction.CREATE,
      entityUuid: savedDriver.uuid,
      entityName: `Driver ${savedDriver.document_number}`,
      description: `Repartidor creado: ${savedDriver.document_number}`,
      newData: {
        document_number: savedDriver.document_number,
        phone: savedDriver.phone,
      },
    });

    return new SuccessResponseDto(
      true,
      'Repartidor creado exitosamente!',
      savedDriver,
    );
  }

  async findAll(
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResponse<DeliveryDriver>> {
    const { limit = 10, page = 1 } = paginationDto || {};

    const [drivers, total] = await this.deliveryDriverRepository.findAndCount({
      relations: ['user'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
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
    const driver = await this.deliveryDriverRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException(`Repartidor con uuid ${uuid} no encontrado!`);
    }

    return new SuccessResponseDto(true, 'Repartidor encontrado!', driver);
  }

  async update(
    uuid: string,
    updateDeliveryDriverDto: UpdateDeliveryDriverDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<DeliveryDriver>> {
    const driverToUpdate = await this.deliveryDriverRepository.findOne({
      where: { uuid },
    });

    if (!driverToUpdate) {
      throw new NotFoundException(`Repartidor con uuid ${uuid} no encontrado!`);
    }

    const oldData = { ...driverToUpdate };

    Object.assign(driverToUpdate, updateDeliveryDriverDto);
    const updatedDriver =
      await this.deliveryDriverRepository.save(driverToUpdate);

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
    const driver = await this.deliveryDriverRepository.findOne({
      where: { uuid },
    });

    if (!driver) {
      throw new NotFoundException(`Repartidor con uuid ${uuid} no encontrado!`);
    }

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
}
