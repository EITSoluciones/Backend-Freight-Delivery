import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { Shipment } from './shipment.entity';
import { ShipmentStatus } from './shipment-status.entity';

@Entity('shipment_events')
export class ShipmentEvent {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Column({ type: 'int' })
  shipment_id!: number;

  @Column({ type: 'int' })
  shipment_status_id!: number;

  @Column({ type: 'int', nullable: true })
  user_id?: number | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.events)
  @JoinColumn({ name: 'shipment_id' })
  shipment!: Shipment;

  @ManyToOne(() => ShipmentStatus)
  @JoinColumn({ name: 'shipment_status_id' })
  shipment_status!: ShipmentStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
