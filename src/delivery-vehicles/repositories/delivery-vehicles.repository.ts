import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Not, Repository } from 'typeorm';
import { QueryDeliveryVehicleDto } from '../dto/query-delivery-vehicle.dto';
import { DeliveryVehicleAssignment } from '../entities/delivery-vehicle-assignment.entity';
import { DeliveryVehicle } from '../entities/delivery-vehicle.entity';

@Injectable()
export class DeliveryVehiclesRepository {
  constructor(
    @InjectRepository(DeliveryVehicle)
    private readonly repository: Repository<DeliveryVehicle>,
    @InjectRepository(DeliveryVehicleAssignment)
    private readonly assignmentRepository: Repository<DeliveryVehicleAssignment>,
  ) {}

  create(vehicle: DeepPartial<DeliveryVehicle>): DeliveryVehicle {
    return this.repository.create(vehicle);
  }

  save(vehicle: DeliveryVehicle): Promise<DeliveryVehicle> {
    return this.repository.save(vehicle);
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }

  findAll(
    queryDto: QueryDeliveryVehicleDto,
  ): Promise<[DeliveryVehicle[], number]> {
    const { limit = 10, page = 1, delivery_driver_uuid } = queryDto;

    return this.repository.findAndCount({
      where: {
        ...(delivery_driver_uuid && {
          driver_assignments: {
            is_active: true,
            delivery_driver: { uuid: delivery_driver_uuid },
          },
        }),
      },
      relations: [
        'driver_assignments',
        'driver_assignments.delivery_driver',
        'driver_assignments.delivery_driver.user',
      ],
      order: {
        created_at: 'DESC',
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  findByUuid(uuid: string): Promise<DeliveryVehicle | null> {
    return this.repository.findOne({
      where: { uuid },
      relations: [
        'driver_assignments',
        'driver_assignments.delivery_driver',
        'driver_assignments.delivery_driver.user',
      ],
    });
  }

  countByDriverId(
    deliveryDriverId: number,
    excludeVehicleId?: number,
  ): Promise<number> {
    return this.assignmentRepository.count({
      where: {
        delivery_driver_id: deliveryDriverId,
        is_active: true,
        deleted_at: IsNull(),
        ...(excludeVehicleId && { delivery_vehicle_id: Not(excludeVehicleId) }),
      },
    });
  }

  async clearPrimaryByDriverId(
    deliveryDriverId: number,
    excludeVehicleId?: number,
  ): Promise<void> {
    const assignments = await this.assignmentRepository.find({
      where: {
        delivery_driver_id: deliveryDriverId,
        is_active: true,
        deleted_at: IsNull(),
        ...(excludeVehicleId && { delivery_vehicle_id: Not(excludeVehicleId) }),
      },
      relations: ['delivery_vehicle'],
    });

    for (const assignment of assignments) {
      assignment.delivery_vehicle.is_primary = false;
      await this.repository.save(assignment.delivery_vehicle);
    }
  }

  findPrimaryByDriverId(
    deliveryDriverId: number,
  ): Promise<DeliveryVehicle | null> {
    return this.repository.findOne({
      where: {
        driver_assignments: {
          delivery_driver_id: deliveryDriverId,
          is_active: true,
        },
        is_primary: true,
      },
      relations: ['driver_assignments'],
    });
  }

  findFirstByDriverId(
    deliveryDriverId: number,
  ): Promise<DeliveryVehicle | null> {
    return this.repository.findOne({
      where: {
        driver_assignments: {
          delivery_driver_id: deliveryDriverId,
          is_active: true,
        },
      },
      relations: ['driver_assignments'],
      order: { created_at: 'ASC' },
    });
  }

  createAssignment(
    assignment: DeepPartial<DeliveryVehicleAssignment>,
  ): DeliveryVehicleAssignment {
    return this.assignmentRepository.create(assignment);
  }

  saveAssignment(
    assignment: DeliveryVehicleAssignment,
  ): Promise<DeliveryVehicleAssignment> {
    return this.assignmentRepository.save(assignment);
  }

  async closeActiveAssignmentsByVehicleId(deliveryVehicleId: number) {
    await this.assignmentRepository.update(
      {
        delivery_vehicle_id: deliveryVehicleId,
        is_active: true,
        deleted_at: IsNull(),
      },
      { is_active: false, end_date: new Date() },
    );
  }
}
