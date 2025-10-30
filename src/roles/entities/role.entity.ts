import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity('roles')
export class Role {

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

    @ManyToMany(() => User, (user) => user.roles)
    users: User[];

    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Permission[];

}
