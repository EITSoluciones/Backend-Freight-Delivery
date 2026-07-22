import { Injectable, NotFoundException } from '@nestjs/common';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  SuccessResponseDto,
  PaginatedResponse,
} from 'src/common/dto/success-response.dto';
import * as bcrypt from 'bcrypt';
import { LogsService } from 'src/logs/logs.service';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { UsersRepository } from './repositories/users.repository';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { PlatformsRepository } from 'src/platforms/repositories/platforms.repository';
import { RolesRepository } from 'src/roles/repositories/roles.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly platformsRepository: PlatformsRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly logsService: LogsService,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) {}

  /** Crear Usuario */
  async create(
    createUserDto: CreateUserDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<User>> {
    try {
      const { password, platforms, roles, ...userData } = createUserDto;

      const platformsIds = await this.findPlatformsByCode(platforms);
      const rolesIds = await this.findRolesByCode(roles);

      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        platforms: platformsIds,
      });

      const savedUser = await this.usersRepository.save(user);
      await this.usersRepository.assignRoles(savedUser, rolesIds);

      await this.logsService.log(currentUser || null, {
        module: LogModule.USERS,
        action: LogAction.CREATE,
        entityUuid: savedUser.uuid,
        entityName: savedUser.username,
        description: `Usuario creado: ${savedUser.username}`,
        newData: { username: savedUser.username, email: savedUser.email },
      });

      return new SuccessResponseDto(
        true,
        'Usuario Creado Exitosamente!',
        savedUser,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  /** Obtener Usuarios */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<User>> {
    const { limit = 10, page = 1 } = paginationDto;
    const [users, total] = await this.usersRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      users,
      total,
      page,
      limit,
      'Usuarios obtenidos exitosamente!',
    );
  }

  /** Buscar Usuario */
  async findOne(uuid: string): Promise<SuccessResponseDto<User>> {
    const user = await this.findUserByUuid(uuid);

    return new SuccessResponseDto(true, 'Usuario Encontrado!', user);
  }

  async getUsersByRole(roles: string): Promise<SuccessResponseDto<User[]>> {
    const users = await this.usersRepository.findByRoleCode(roles);

    return new SuccessResponseDto(
      true,
      'Usuarios obtenidos exitosamente!',
      users,
    );
  }

  /** Actualizar Parcialmente Usuario */
  async partialUpdate(
    uuid: string,
    updateUserDto: UpdateUserDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<User>> {
    const { password, platforms, roles, ...userDataToUpdate } = updateUserDto;

    const userToUpdate = await this.findUserByUuid(uuid);

    try {
      const oldData = { ...userToUpdate };

      Object.assign(userToUpdate, userDataToUpdate);

      if (password) {
        userToUpdate.password = bcrypt.hashSync(password, 10);
      }

      if (platforms) {
        const platformsEntities = await this.findPlatformsByCode(platforms);
        userToUpdate.platforms = platformsEntities;
      }

      if (roles) {
        const rolesEntities = await this.findRolesByCode(roles);
        await this.usersRepository.assignRoles(userToUpdate, rolesEntities);
      }

      const updatedUser = await this.usersRepository.save(userToUpdate);

      await this.logsService.log(currentUser || null, {
        module: LogModule.USERS,
        action: LogAction.UPDATE,
        entityUuid: updatedUser.uuid,
        entityName: updatedUser.username,
        description: `Usuario actualizado: ${updatedUser.username}`,
        oldData,
        newData: {
          ...userDataToUpdate,
          ...(platforms && { platforms }),
          ...(roles && { roles }),
          ...(password && { password: '[updated]' }),
        },
      });

      return new SuccessResponseDto(
        true,
        'Usuario actualizado exitosamente!',
        updatedUser,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  /** Eliminar Usuario */
  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<User>> {
    const user = await this.usersRepository.findByUuidWithoutRelations(uuid);

    if (!user) {
      throw new NotFoundException(
        `El usuario con uuid ${uuid} no se encontró!`,
      );
    }

    await this.usersRepository.softDeleteByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.USERS,
      action: LogAction.DELETE,
      entityUuid: user.uuid,
      entityName: user.username,
      description: `Usuario eliminado: ${user.username}`,
      oldData: { username: user.username, email: user.email },
    });

    return new SuccessResponseDto(
      true,
      'Usuario eliminado exitosamente!',
      user,
    );
  }

  async findPlatformsByCode(codes: string[]): Promise<Platform[]> {
    const platformsIds = await this.platformsRepository.findByCodes(codes);
    const missingCodes = codes.filter(
      (code) => !platformsIds.some((p) => p.code === code),
    );
    if (missingCodes.length)
      throw new NotFoundException(
        `Plataformas no encontradas: ${missingCodes.join(', ')}`,
      );
    return platformsIds;
  }

  async findRolesByCode(codes: string[]): Promise<Role[]> {
    const rolesIds = await this.rolesRepository.findRolesByCodes(codes);
    const missingCodes = codes.filter(
      (code) => !rolesIds.some((p) => p.code === code),
    );
    if (missingCodes.length)
      throw new NotFoundException(
        `Roles no encontradas: ${missingCodes.join(', ')}`,
      );
    return rolesIds;
  }

  async findUserByUuid(uuid: string): Promise<User> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw new NotFoundException(
        `El usuario con uuid ${uuid} no se encontró!`,
      );
    }

    return user;
  }

  /** Búsqueda de usuario por email o nickname */
  async search(
    email?: string,
    username?: string,
  ): Promise<SuccessResponseDto<User[]>> {
    const response = await this.usersRepository.search(email, username);

    return new SuccessResponseDto(true, 'Respuesta Obtenida!', response);
  }
}
