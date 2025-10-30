import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('platforms')
export class Platform {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToMany(() => User, (user) => user.platforms)
  users: User[];

}
