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

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column('text')
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ type: 'bool', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @BeforeInsert()
  processBeforeInsert() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
