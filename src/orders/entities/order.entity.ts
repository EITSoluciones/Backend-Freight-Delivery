import { Center } from 'src/centers/entities/center.entity';
import { Customer } from 'src/customers/entities/customer.entity';
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
