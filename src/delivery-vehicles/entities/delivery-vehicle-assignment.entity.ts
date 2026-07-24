import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DeliveryDriver } from 'src/delivery-drivers/entities/delivery-driver.entity';
import { DeliveryVehicle } from './delivery-vehicle.entity';

@Entity('delivery_vehicle_assignments')
export class DeliveryVehicleAssignment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Column({ type: 'int' })
  delivery_driver_id!: number;

  @Column({ type: 'int' })
  delivery_vehicle_id!: number;

  @Column({ type: 'timestamp', name: 'start_date' })
  start_date!: Date;

  @Column({ type: 'timestamp', name: 'end_date', nullable: true })
  end_date?: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => DeliveryDriver, (driver) => driver.vehicle_assignments)
  @JoinColumn({ name: 'delivery_driver_id' })
  delivery_driver!: DeliveryDriver;

  @ManyToOne(() => DeliveryVehicle, (vehicle) => vehicle.driver_assignments)
  @JoinColumn({ name: 'delivery_vehicle_id' })
  delivery_vehicle!: DeliveryVehicle;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
