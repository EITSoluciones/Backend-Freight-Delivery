import { Platform } from "src/platforms/entities/platform.entity";
import { Role } from "src/roles/entities/role.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('increment')
    id: number;            // ID auto-incremental

    @Column({ type: 'uuid', unique: true })
    uuid: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column('varchar', {
        unique: true,
    })
    email: string;

    @Column('varchar', {
        nullable: true
    })
    name?: string;

    @Column('varchar', {
        nullable: true
    })
    last_name?: string;

    @Column('varchar', {
        select: false
    })
    password: string;

    @Column('bool', {
        default: true,
    })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deleted_at?: Date | null;

    @ManyToMany(() => Platform, (platform) => platform.users)
    @JoinTable({
        name: 'user_platforms',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'platform_id', referencedColumnName: 'id' },
    })
    platforms: Platform[];

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4(); 
    }

}
