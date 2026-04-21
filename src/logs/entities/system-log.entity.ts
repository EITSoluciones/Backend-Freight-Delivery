import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('system_logs')
// Eliminamos índices individuales innecesarios si ya están en el compuesto
@Index(['userUuid'])
@Index(['createdAt'])
@Index(['userUuid', 'module', 'action']) 
export class SystemLog {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 36, nullable: true })
  userUuid?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userUsername?: string | null;

  @Column({ type: 'varchar', length: 100 })
  module!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  entityUuid?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityName?: string | null;

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