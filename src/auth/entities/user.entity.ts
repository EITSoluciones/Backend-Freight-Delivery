import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('increment')
    id: number;            // ID auto-incremental

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column('varchar', {
        unique: true,
    })
    email: string;

    @Column('varchar', {
        select: false
    })
    password: string;

    @Column('varchar', {
        nullable: true
    })
    name?: string;

    @Column('varchar', {
        nullable: true
    })
    last_name?: string;

    @Column('bool', {
        default: true,
    })
    isActive: boolean;

    //Postgres
    // @Column('text', {
    //     array: true,
    //     default: ['user']
    // })
    // roles: string[];

    //MySQL
    @Column('simple-json', { nullable: true })
    roles: string[] | null;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.email = this.email.toLowerCase().trim();
    }

}
