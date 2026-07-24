import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  create(user: DeepPartial<User>): User {
    return this.repository.create(user);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async assignRoles(user: User, roles: Role[]): Promise<void> {
    await this.userRoleRepository.delete({ user_id: user.id });
    await this.userRoleRepository.save(
      roles.map((role) =>
        this.userRoleRepository.create({
          user_id: user.id,
          role_id: role.id,
        }),
      ),
    );

    user.roles = roles;
  }

  softDeleteByUuid(uuid: string) {
    return this.repository.softDelete({ uuid });
  }

  async findAll(paginationDto: PaginationDto): Promise<[User[], number]> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    const [users, total] = await this.repository.findAndCount({
      where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['platforms', 'user_roles', 'user_roles.role'],
    });

    return [users.map((user) => this.withRoles(user)), total];
  }

  async findByUuid(uuid: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { uuid },
      relations: ['platforms', 'user_roles', 'user_roles.role'],
    });

    return this.withRoles(user);
  }

  async findByUuidWithPermissions(uuid: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { uuid },
      relations: [
        'user_roles',
        'user_roles.role',
        'user_roles.role.permissions',
        'user_roles.role.permissions.module',
        'user_roles.role.permissions.module.module_category',
      ],
    });

    return this.withRoles(user);
  }

  async findByUsernameForLogin(username: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { username },
      select: {
        id: true,
        uuid: true,
        username: true,
        name: true,
        last_name: true,
        password: true,
        is_active: true,
      },
      relations: ['platforms', 'user_roles', 'user_roles.role'],
    });

    return this.withRoles(user);
  }

  findByUuidWithoutRelations(uuid: string): Promise<User | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  async findByRoleCode(roleCode: string): Promise<User[]> {
    const users = await this.repository.find({
      where: {
        is_active: true,
        user_roles: {
          role: {
            code: roleCode,
            is_active: true,
          },
        },
      },
      relations: ['user_roles', 'user_roles.role'],
      order: {
        username: 'ASC',
      },
    });

    return users.map((user) => this.withRoles(user));
  }

  search(email?: string, username?: string): Promise<User[]> {
    if (email && username) {
      return this.repository.find({
        where: [{ email }, { username }],
      });
    }

    if (email) {
      return this.repository.find({ where: { email } });
    }

    if (username) {
      return this.repository.find({ where: { username } });
    }
    return this.repository.find();
  }

  private withRoles<T extends User | null>(user: T): T {
    if (user) {
      user.roles = user.user_roles?.map((userRole) => userRole.role) ?? [];
    }

    return user;
  }
}
