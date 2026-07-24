import { Role } from 'src/roles/entities/role.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({ type: 'int' })
  user_id!: number;

  @PrimaryColumn({ type: 'int' })
  role_id!: number;

  @ManyToOne(() => User, (user) => user.user_roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Role, (role) => role.user_roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;
}
