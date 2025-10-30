import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UsersService {

    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(Platform)
      private readonly platformRepository: Repository<Platform>,
      @InjectRepository(Role)
      private readonly roleRepository: Repository<Role>
    ) {}


  async create(createUserDto: CreateUserDto) {
    try {
      const { password, platforms, roles, ...userData } = createUserDto;

      const platformsIds = await this.findPlatformsByCode(platforms);
      const rolesIds = await this.findRolesByCode(roles);

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        platforms: platformsIds,
        roles: rolesIds
      });

      const savedUser = await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [users, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: ['platforms', 'roles'],
    });

    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      data: usersWithoutPassword,
      total,
      limit,
      offset
    };
  }

  async findOne(uuid: string) {
    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: ['platforms', 'roles']
    });

    if (!user) {
      throw new NotFoundException(`User with uuid ${uuid} not found`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    const { platforms, roles, ...userDataToUpdate } = updateUserDto;

    const user = await this.userRepository.preload({
        uuid: uuid,
        ...userDataToUpdate,
    });

    if (!user) throw new NotFoundException(`User with uuid: ${uuid} not found`);

    try {
      if (platforms) {
        const platformsEntities = await this.findPlatformsByCode(platforms);
        user.platforms = platformsEntities;
      }

      if (roles) {
        const rolesEntities = await this.findRolesByCode(roles);
        user.roles = rolesEntities;
      }

      const updatedUser = await this.userRepository.save(user);
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(uuid: string) {
    const user = await this.findOne(uuid); // Re-uses findOne to ensure user exists
    await this.userRepository.softDelete({ uuid });
    return { message: `User with uuid ${uuid} has been successfully deleted.` };
  }

  async findPlatformsByCode(codes: string[]): Promise<Platform[]> {
    const platformsIds = await this.platformRepository.find({
      where: { code: In(codes) },
    });
    const missingCodes = codes.filter(code => !platformsIds.some(p => p.code === code));
    if (missingCodes.length) throw new NotFoundException(`Plataformas no encontradas: ${missingCodes.join(', ')}`);
    return platformsIds;
  }

  async findRolesByCode(codes: string[]): Promise<Role[]> {
    const rolesIds = await this.roleRepository.find({
      where: { code: In(codes) },
    });
    const missingCodes = codes.filter(code => !rolesIds.some(p => p.code === code));
    if (missingCodes.length) throw new NotFoundException(`Roles no encontradas: ${missingCodes.join(', ')}`);
    return rolesIds;
  }

  private handleDBErrors(error: any): never {
    if (error instanceof NotFoundException) throw error;

    if (error instanceof QueryFailedError) {
      if ((error as any).errno === 1062) {
        throw new BadRequestException((error as any).detail || (error as any).sqlMessage || 'Duplicate entry');
      }
    }

    console.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
