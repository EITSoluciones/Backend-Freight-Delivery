import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";
import { Module } from "src/modules/entities/module.entity";
import { Exclude } from "class-transformer";
import { v4 as uuidv4 } from 'uuid';

@Entity('permissions')
export class Permission {

    @Exclude()
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'uuid', unique: true })
    uuid: string;

    @Column({ length: 50, unique: true })
    code: string;

    @Column({ length: 100 })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn({
        type: 'timestamp',
        precision: 6, //indica que el timestamp guardará 6 dígitos de fracción de segundo (microsegundos).
        name: 'created_at',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        precision: 6,
        name: 'updated_at',
    })
    updated_at: Date;

    @DeleteDateColumn({
        type: 'timestamp',
        precision: 6,
        name: 'deleted_at',
        nullable: true,
    })
    deleted_at?: Date | null;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

    @ManyToOne(() => Module, (module) => module.permissions)
    @JoinColumn({ name: 'module_id' })
    module: Module;

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }
}
