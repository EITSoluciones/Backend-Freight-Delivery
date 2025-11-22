import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) { }

  /** Crear Usuario */
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

      return {
        success: true,
        message: "Usuario Creado Exitosamente!",
        data: savedUser,
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  /** Obtener Usuarios */
  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit; //conversión a offset

    const [users, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: ['platforms', 'roles'],
    });

    // const usersWithoutPassword = users.map(user => {
    //   const { password, ...userWithoutPassword } = user;
    //   return userWithoutPassword;
    // });

    return {
      success: true,
      message: "Usuarios obtenidos exitosamente!",
      data: users,
      pagination: {
        pageNumber: page,
        totalPages: limit,
        totalCount: total,
        hasPreviousPage: (page > 1),
        hasNextPage: (total > (page * limit)), //Validar formula
      }
    };

  }

  /** Buscar Usuario */
  async findOne(uuid: string) {

    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: ['platforms', 'roles']
    });

    if (!user) {
      throw new NotFoundException(`El usuario con uuid ${uuid} no se encontró!`);
    }

    return {
      success: true,
      message: "Usuario Encontrado!",
      data: user,
    };

  }

  /** Actualizar Parcialmente Usuario */
  async partialUpdate(uuid: string, updateUserDto: UpdateUserDto) {

    const { platforms, roles, ...userDataToUpdate } = updateUserDto;

    const userToUpdate = await this.userRepository.findOne({
      where: { uuid },
      relations: ['platforms', 'roles'],
    });

    if (!userToUpdate) throw new NotFoundException(`Usuario con uuid: ${uuid} no encontrado`);

    try {
      // Solo actualiza campos enviados
      Object.assign(userToUpdate, userDataToUpdate);

      // Actualiza plataformas si se enviaron
      if (platforms) {
        const platformsEntities = await this.findPlatformsByCode(platforms);
        userToUpdate.platforms = platformsEntities;
      }

      // Actualiza roles si se enviaron
      if (roles) {
        const rolesEntities = await this.findRolesByCode(roles);
        userToUpdate.roles = rolesEntities;
      }

      const updatedUser = await this.userRepository.save(userToUpdate);

      return {
        success: true,
        message: "Usuario actualizado exitosamente!",
        data: updatedUser,
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  /** Eliminar Usuario */
  async remove(uuid: string) {

    const user = await this.userRepository.findOne({
      where: { uuid }
    });

    if (!user) {
      throw new NotFoundException(`El usuario con uuid ${uuid} no se encontró!`);
    }

    await this.userRepository.softDelete({ uuid });

    return {
      success: true,
      message: "Usuario eliminado exitosamente!",
      data: user,
    };

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
        throw new BadRequestException((error as any).detail || (error as any).sqlMessage || 'Registro Duplicado');
      }
    }

    console.error(error);
    throw new InternalServerErrorException('Error del Servidor. Porfavor contacte al administrador del sistema!');
  }
}
