import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  id: number;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  jti: string;

  @Column({ type: 'varchar', length: 200 })
  token: string;

  @Index()
  @Column({ type: 'uuid' })
  uuid_user: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uuid_user', referencedColumnName: 'uuid' })
  user: User;


  @Column({ type: 'int' })
  platform_id: number;

  @ManyToOne(() => Platform, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'platform_id', referencedColumnName: 'id' })
  platform: Platform;

  @Column({ type: 'timestamp', precision: 6 })
  expires_on_utc: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;
}