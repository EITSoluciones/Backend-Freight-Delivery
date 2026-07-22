import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Address } from 'src/addresses/entities/address.entity';
import { Company } from 'src/company/entities/company.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { DeliveryDriver } from 'src/delivery-drivers/entities/delivery-driver.entity';
import { DeliveryVehicle } from 'src/delivery-vehicles/entities/delivery-vehicle.entity';
import { ShipmentEvent } from './shipment-event.entity';
import { ShipmentStatus } from './shipment-status.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Column({ type: 'int', nullable: true })
  company_id?: number | null;

  @Column({ type: 'int', nullable: true })
  customer_id?: number | null;

  @Column({ type: 'int', nullable: true })
  delivery_driver_id?: number | null;

  @Column({ type: 'int', nullable: true })
  delivery_vehicle_id?: number | null;

  @Column({ type: 'int' })
  shipment_status_id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  tracking_number!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_number?: string | null;

  @Column({ type: 'int', nullable: true })
  origin_address_id?: number | null;

  @Column({ type: 'int', nullable: true })
  destination_address_id?: number | null;

  @Column({ type: 'varchar', length: 255 })
  recipient_name!: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  recipient_phone?: string | null;

  @Column({ type: 'text' })
  destination_text!: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at?: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company | null;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer | null;

  @ManyToOne(() => DeliveryDriver, { nullable: true })
  @JoinColumn({ name: 'delivery_driver_id' })
  delivery_driver?: DeliveryDriver | null;

  @ManyToOne(() => DeliveryVehicle, { nullable: true })
  @JoinColumn({ name: 'delivery_vehicle_id' })
  delivery_vehicle?: DeliveryVehicle | null;

  @ManyToOne(() => ShipmentStatus)
  @JoinColumn({ name: 'shipment_status_id' })
  shipment_status!: ShipmentStatus;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'origin_address_id' })
  origin_address?: Address | null;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'destination_address_id' })
  destination_address?: Address | null;

  @OneToMany(() => ShipmentEvent, (event) => event.shipment)
  events!: ShipmentEvent[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
