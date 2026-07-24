import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
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

  findRoles(paginationDto: PaginationDto): Promise<[Role[], number]> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    return this.roleRepository.findAndCount({
      where: {
        ...(is_active !== undefined && { is_active: is_active === 'true' }),
      },
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
      where: { is_active: true },
      relations: ['module'],
    });
  }

  findActivePermissionsByUuids(uuids: string[]): Promise<Permission[]> {
    return this.permissionRepository.findBy({
      uuid: In(uuids),
      is_active: true,
    });
  }
}
