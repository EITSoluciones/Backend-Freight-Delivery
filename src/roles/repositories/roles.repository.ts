import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Like, Not, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from 'src/users/entities/user-role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  createRole(role: DeepPartial<Role>): Role {
    return this.roleRepository.create(role);
  }

  saveRole(role: Role): Promise<Role> {
    return this.roleRepository.save(role);
  }

  softDeleteRoleByUuid(uuid: string) {
    return this.roleRepository.softDelete({ uuid });
  }

  findActiveRoles(): Promise<Role[]> {
    return this.roleRepository.find({ where: { is_active: true } });
  }

  findRoles(paginationDto: PaginationDto, excludeCodes: string[] = []): Promise<[Role[], number]> {
    const { limit = 10, page = 1, is_active, search } = paginationDto;

    const base = {
      ...(is_active !== undefined && { is_active: is_active === 'true' }),
      ...(excludeCodes.length > 0 && { code: Not(In(excludeCodes)) }),
    };

    const term = search?.trim();
    const like = term ? `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null;

    return this.roleRepository.findAndCount({
      where: like
        ? [
            { ...base, name: Like(like) },
            { ...base, code: Like(like) },
          ]
        : base,
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  findRoleByUuid(uuid: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { uuid } });
  }

  findRoleByUuidWithPermissions(uuid: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { uuid },
      relations: ['permissions'],
    });
  }

  findRoleByUuidWithUsers(uuid: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { uuid },
      relations: ['user_roles', 'user_roles.user'],
    });
  }

  findRolesByCodes(codes: string[]): Promise<Role[]> {
    return this.roleRepository.find({ where: { code: In(codes) } });
  }

  findActivePermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { is_active: true, module: { is_active: true } },
      relations: ['module'],
    });
  }

  findActivePermissionsByUuids(uuids: string[]): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: {
        uuid: In(uuids),
        is_active: true,
        module: { is_active: true },
      },
      relations: ['module'],
    });
  }

  async hasUsersAssigned(roleId: number): Promise<boolean> {
    const count = await this.userRoleRepository.count({
      where: { role_id: roleId },
    });
    return count > 0;
  }
}
