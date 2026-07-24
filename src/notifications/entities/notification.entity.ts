import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { NotificationChannel } from '../enums/notification-channel.enum';

@Entity('notifications')
export class Notification {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  channel!: NotificationChannel;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false })
  is_global!: boolean;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
