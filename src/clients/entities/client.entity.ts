import {
  Address
} from "src/addresses/entities/address.entity";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {
  v4 as uuidv4
} from 'uuid';

@Entity('clients')
export class Client {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'uuid',
    unique: true
  })
  uuid: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 25,
    nullable: true
  })
  phone: string;

  @Column('bool', {
    default: true
  })
  is_active: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at'
  })
  updated_at: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true
  })
  deleted_at ? : Date | null;

  @OneToMany(() => Address, (address) => address.client, {
    cascade: true,
    eager: true
  })
  addresses: Address[];

  @BeforeInsert()
  generateUuid() {
    this.uuid = uuidv4();
  }

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    this.code = this.code.toUpperCase().trim();
  }

}