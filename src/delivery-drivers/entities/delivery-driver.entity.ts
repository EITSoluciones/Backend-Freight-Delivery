import { Exclude } from 'class-transformer';
import { DeliveryVehicle } from 'src/delivery-vehicles/entities/delivery-vehicle.entity';
import { User } from 'src/users/entities/user.entity';
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

@Entity('delivery_drivers')
export class DeliveryDriver {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  id!: number; // ID auto-incremental

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Exclude()
  @Column({ type: 'int', name: 'user_id' })
  user_id!: number;

  @Column({ length: 50, default: 'default' })
  profile!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ name: 'driver_type', length: 20 })
  driver_type!: string;

  @Column({ name: 'document_type', length: 30 })
  document_type!: string;

  @Column({ name: 'document_number', length: 50 })
  document_number!: string;

  @Column({ name: 'license_type', length: 30 })
  license_type!: string;

  @Column({ name: 'license_number', length: 50 })
  license_number!: string;

  @Column({ name: 'license_expiration', type: 'date' })
  license_expiration!: Date;

  @Column({ length: 20, default: 'active' })
  status!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => DeliveryVehicle, (vehicle) => vehicle.delivery_driver)
  vehicles!: DeliveryVehicle[];

  @BeforeInsert()
  generateUuid() {
    this.uuid = uuidv4();
  }
}
