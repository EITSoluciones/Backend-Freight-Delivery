import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shipment_statuses')
export class ShipmentStatus {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}
