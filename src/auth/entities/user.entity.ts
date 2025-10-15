import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('increment')
    id: number;            // ID auto-incremental

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column('text', {
        unique: true,
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text', {
        nullable: true
    })
    name?: string;

    @Column('text', {
        nullable: true
    })
    last_name?: string;

    @Column('bool', {
        default: true,
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

}
