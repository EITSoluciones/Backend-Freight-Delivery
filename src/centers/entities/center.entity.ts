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

@Entity('centers')
export class Center {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

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

  @Column({ type: 'bool', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @BeforeInsert()
  processBeforeInsert() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }

    this.code = this.code.toUpperCase().trim();
  }
}
