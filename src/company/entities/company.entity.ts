import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyFiscalAddress } from './company-fiscal-address.entity';
import { CompanyDocument } from './company-document.entity';
import { CompanyConfig } from './company-config.entity';

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_ACTIVATION = 'pending_activation',
  SUSPENDED = 'suspended',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  commercial_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code_activation: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: CompanyStatus.PENDING_ACTIVATION,
  })
  status: CompanyStatus;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @OneToMany(() => CompanyFiscalAddress, (address) => address.company, {
    cascade: true,
  })
  fiscal_addresses: CompanyFiscalAddress[];

  @OneToMany(() => CompanyDocument, (document) => document.company, {
    cascade: true,
  })
  documents: CompanyDocument[];

  @OneToMany(() => CompanyConfig, (config) => config.company, { cascade: true })
  configs: CompanyConfig[];
}
