import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Module } from './module.entity';

@Entity('module_categories')
export class ModuleCategory {
  @Exclude()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uuid!: string;

  @Column({ type: 'int', nullable: true })
  sort_order?: number | null;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    precision: 6,
    name: 'created_at',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 6,
    name: 'updated_at',
  })
  updated_at!: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    precision: 6,
    name: 'deleted_at',
    nullable: true,
  })
  deleted_at?: Date | null;

  @OneToMany(() => Module, (module) => module.module_category)
  modules!: Module[];

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
