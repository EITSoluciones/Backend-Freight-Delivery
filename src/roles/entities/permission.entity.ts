import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";

@Entity('permissions')
export class Permission {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 50 })
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

}
