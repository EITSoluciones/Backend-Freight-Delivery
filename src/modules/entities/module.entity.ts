import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { ModuleCategory } from "src/module-categories/entities/module-category.entity";
import { Permission } from "src/roles/entities/permission.entity";
import { Exclude } from "class-transformer";

@Entity('modules')
export class Module {

    @Exclude()
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'uuid', unique: true })
    uuid: string;

    @Exclude()
    @Column({ type: 'int', name: 'module_category_id' })
    module_category_id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    icon: string;

    @Column({ type: 'varchar', length: 250 })
    url: string;

    @Column('bool', { default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deleted_at?: Date | null;

    @ManyToOne(() => ModuleCategory)
    @JoinColumn({ name: 'module_category_id' })
    module_category: ModuleCategory;

    @OneToMany(() => Permission, (permission) => permission.module)
    permissions: Permission[];

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }
}
