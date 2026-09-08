import { Center } from 'src/centers/entities/center.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { OrderPriority } from '../enums/order-priority.enum';
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

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  order_number!: string;

  @Column({ type: 'timestamp', nullable: true })
  order_date?: Date | null;

  @Column({ type: 'int' })
  customer_id!: number;

  @Column({ type: 'text', nullable: true })
  additional_notes?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  volume?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  weight?: number | null;

  @Column({ type: 'int', nullable: true })
  origin_center_id?: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  priority?: OrderPriority | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipient_name?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipient_email?: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  recipient_phone?: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  recipient_secondary_phone?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  internal_number?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  external_number?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  neighborhood?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  district?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country?: string | null;

  @Column({ type: 'varchar', length: 12, nullable: true })
  postal_code?: string | null;

  @Column({ type: 'text', nullable: true })
  reference?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  delivery_window_start?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivery_window_end?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivery_date?: Date | null;

  @Column({ type: 'bool', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => Center, { nullable: true })
  @JoinColumn({ name: 'origin_center_id' })
  origin_center?: Center | null;

  @BeforeInsert()
  processBeforeInsert() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }

    this.order_number = this.order_number.trim();
  }
}
