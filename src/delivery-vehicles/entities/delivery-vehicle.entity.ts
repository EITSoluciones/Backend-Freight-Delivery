import { Exclude } from 'class-transformer';
import { DeliveryDriver } from 'src/delivery-drivers/entities/delivery-driver.entity';
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

@Entity('delivery_vehicles')
export class DeliveryVehicle {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Exclude()
  @Column({ type: 'int', name: 'delivery_driver_id' })
  delivery_driver_id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'varchar', length: 20 })
  plate_number!: string;

  @Column({ type: 'varchar', length: 20 })
  vehicle_type!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string | null;

  @Column({ type: 'int', nullable: true })
  year?: number | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @Column({ type: 'bool', default: false })
  is_primary!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => DeliveryDriver, (driver) => driver.vehicles)
  @JoinColumn({ name: 'delivery_driver_id' })
  delivery_driver!: DeliveryDriver;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
