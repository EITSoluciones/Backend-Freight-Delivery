import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('system_logs')
@Index(['createdAt'])
@Index(['userId'])
@Index(['moduleId'])
@Index(['userId', 'moduleId', 'action'])
export class SystemLog {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId?: number | null;

  @Column({ type: 'int', name: 'module_id', nullable: true })
  moduleId?: number | null;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'json', nullable: true })
  oldData?: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  newData?: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  platform?: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;
}
