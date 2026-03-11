import { Exclude } from "class-transformer";
import { User } from "src/users/entities/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

@Entity('delivery_drivers')
export class DeliveryDriver {

    @Exclude()
    @PrimaryGeneratedColumn('increment')
    id: number;            // ID auto-incremental

    @Column({ type: 'uuid', unique: true })
    uuid: string;

    @Exclude()
    @Column({ type: 'int', name: 'user_id' })
    user_id: number;

    @Column({ length: 20 })
    phone: string;

    // @Column({ name: 'document_type', length: 20 })
    // document_type: string; // CURP, RFC, DNI, PASSPORT, etc.

    @Column({ name: 'document_number', length: 50 })
    document_number: string;

    @Column({ name: 'license_number', length: 50 })
    license_number: string;

    // @Column({ name: 'license_type', length: 20 })
    // license_type: string; // A, B, C, Motorcycle, etc.

    @Column({ name: 'license_expiration', type: 'date' })
    license_expiration: Date;

    // @Column({ name: 'vehicle_type', length: 20 })
    // vehicle_type: string; // motorcycle, car, van, truck

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @BeforeInsert()
    generateUuid() {
        this.uuid = uuidv4();
    }

}
