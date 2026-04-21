import { Customer } from 'src/customers/entities/customer.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    type: 'uuid',
    unique: true,
  })
  uuid!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  street!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'external_number',
    nullable: true,
  })
  external_number?: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'internal_number',
    nullable: true,
  })
  internal_number?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  neighborhood!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  municipality!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  state!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  country!: string;

  @Column({
    type: 'varchar',
    length: 10,
    name: 'postal_code',
  })
  postal_code!: string;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude?: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude?: number | null;

  @Column('bool', {
    default: false,
    name: 'is_primary',
  })
  is_primary!: boolean;

  @Column('bool', {
    default: true,
  })
  is_active!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updated_at!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deleted_at?: Date | null;

  @ManyToOne(() => Customer, (customer) => customer.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'customer_id',
  })
  customer!: Customer;

  @BeforeInsert()
  generateUuid() {
    this.uuid = uuidv4();
  }
}
