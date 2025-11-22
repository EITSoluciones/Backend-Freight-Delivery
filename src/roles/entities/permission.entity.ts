import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";
import { Module } from "src/modules/entities/module.entity";
import { Exclude } from "class-transformer";


@Entity('permissions')
export class Permission {

    @Exclude()
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'int', name: 'module_id' })
    module_id: number;

    @Column({ length: 50, unique: true })
    code: string;

    @Column({ length: 100 })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

    @ManyToOne(() => Module, (module) => module.permissions)
    @JoinColumn({ name: 'module_id' })
    module: Module;

}
