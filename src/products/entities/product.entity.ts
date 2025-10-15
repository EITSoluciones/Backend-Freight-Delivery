import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('increment')
    id: number;            // ID auto-incremental

    @Column('text')
    nombre: string;        // Nombre del producto

    @Column({ type: 'text', nullable: true })
    descripcion?: string;  // Descripción opcional

    @Column('int')
    stock: number;         // Cantidad en inventario

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}
