import { Exclude } from "class-transformer";
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity('module_categories')
export class ModuleCategory {

    @Exclude()
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'uuid', unique: true })
    uuid: string;

    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('bool', { default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deleted_at?: Date | null;

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }
}
