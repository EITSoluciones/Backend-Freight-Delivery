import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly logsService: LogsService,
  ) { }

  /** Crear Usuario */
  async create(
    createUserDto: CreateUserDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<User>> {
    try {
      const { password, platforms, roles, ...userData } = createUserDto;

      const platformsIds = await this.findPlatformsByCode(platforms);
      const rolesIds = await this.findRolesByCode(roles);

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        platforms: platformsIds,
        roles: rolesIds,
      });

      const savedUser = await this.userRepository.save(user);

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
      this.handleDBErrors(error);
    }
  }

  /** Obtener Usuarios */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<User>> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    const bool = is_active === 'true';

    const where = {
      ...(bool !== undefined && { is_active: bool }),
    };

    const [users, total] = await this.userRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      relations: ['platforms', 'roles'],
    });

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
    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: ['platforms', 'roles'],
    });

    if (!user) {
      throw new NotFoundException(
        `El usuario con uuid ${uuid} no se encontró!`,
      );
    }

    return new SuccessResponseDto(true, 'Usuario Encontrado!', user);
  }

  async getUsersByRole(roles: string): Promise<SuccessResponseDto<User[]>> {
    const users = await this.userRepository.find({
      where: {
        is_active: true,
        roles: {
          code: roles,
          is_active: true,
        },
      },
      relations: ['roles'],
      order: {
        username: 'ASC',
      },
    });

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

    const userToUpdate = await this.userRepository.findOne({
      where: { uuid },
      relations: ['platforms', 'roles'],
    });

    if (!userToUpdate)
      throw new NotFoundException(`Usuario con uuid: ${uuid} no encontrado`);

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
        userToUpdate.roles = rolesEntities;
      }

      const updatedUser = await this.userRepository.save(userToUpdate);

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
      this.handleDBErrors(error);
    }
  }

  /** Eliminar Usuario */
  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<User>> {
    const user = await this.userRepository.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new NotFoundException(
        `El usuario con uuid ${uuid} no se encontró!`,
      );
    }

    await this.userRepository.softDelete({ uuid });

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
    const platformsIds = await this.platformRepository.find({
      where: { code: In(codes) },
    });
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
    const rolesIds = await this.roleRepository.find({
      where: { code: In(codes) },
    });
    const missingCodes = codes.filter(
      (code) => !rolesIds.some((p) => p.code === code),
    );
    if (missingCodes.length)
      throw new NotFoundException(
        `Roles no encontradas: ${missingCodes.join(', ')}`,
      );
    return rolesIds;
  }


  private handleDBErrors(error: any): never {
    if (error instanceof NotFoundException) throw error;

    if (error instanceof QueryFailedError) {
      if ((error as any).errno === 1062) {
        throw new BadRequestException(
          (error as any).detail ||
          (error as any).sqlMessage ||
          'Registro Duplicado',
        );
      }
    }

    console.error(error);
    throw new InternalServerErrorException(
      'Error del Servidor. Porfavor contacte al administrador del sistema!',
    );
  }

  /** Búsqueda de usuario por email o nickname */
  async search(
    email?: string,
    username?: string,
  ): Promise<SuccessResponseDto<User[]>> {
    const query = this.userRepository.createQueryBuilder('user');

    if (email && username) {
      query.where('user.email = :email OR user.username = :username', {
        email,
        username,
      });
    } else if (email) {
      query.where('user.email = :email', { email });
    } else if (username) {
      query.where('user.username = :username', { username });
    }

    const response = await query.getMany();

    return new SuccessResponseDto(true, 'Respuesta Obtenida!', response);
  }
}
