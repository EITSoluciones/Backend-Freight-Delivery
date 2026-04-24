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
  OneToMany,
  OneToOne,
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
  @Column({ type: 'int', name: 'user_id', unique: true })
  user_id!: number;

  @Column({ length: 20 })
  phone!: string;

  @Column({ name: 'driver_type', length: 20 })
  driver_type!: string;

  @Column({ name: 'profile_photo', length: 255, nullable: true })
  profile_photo?: string;

  @Column({ name: 'identity_document_type', length: 30 })
  identity_document_type!: string;

  @Column({ name: 'identity_document_number', length: 50 })
  identity_document_number!: string;

  @Column({ name: 'license_type', length: 30 })
  license_type!: string;

  @Column({ name: 'license_number', length: 50 })
  license_number!: string;

  @Column({ name: 'license_expiration', type: 'date' })
  license_expiration!: Date;

  @Column('bool', {
    default: true,
  })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => DeliveryVehicle, (vehicle) => vehicle.delivery_driver)
  vehicles!: DeliveryVehicle[];

  @BeforeInsert()
  generateUuid() {
    this.uuid = uuidv4();
  }
}
