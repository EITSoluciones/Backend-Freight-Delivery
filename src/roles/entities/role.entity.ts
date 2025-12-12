import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { Exclude } from "class-transformer";
import { v4 as uuidv4 } from 'uuid';

@Entity('roles')
export class Role {

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

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }

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
