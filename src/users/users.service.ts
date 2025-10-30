import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(Platform)
      private readonly platformRepository: Repository<Platform>,
      @InjectRepository(Role)
      private readonly RoleRepository: Repository<Role>
    ) {
  
    }


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
      console.log("error");
      this.handleDBErrors(error);
    }

  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
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

    const rolesIds = await this.RoleRepository.find({
      where: { code: In(codes) },
    });

    const missingCodes = codes.filter(code => !rolesIds.some(p => p.code === code));

    if (missingCodes.length) throw new NotFoundException(`Roles no encontradas: ${missingCodes.join(', ')}`);

    return rolesIds;

  }

    private handleDBErrors(error: any): never { // never -> Nunca va regresar un valor el método 

    if (error instanceof NotFoundException) throw error;

    if (error instanceof QueryFailedError) {
      // MySQL código 1062 = duplicado
      if ((error as any).errno === 1062) {
        throw new BadRequestException((error as any).detail || (error as any).sqlMessage || 'Duplicate entry');
      }
    }

    throw new InternalServerErrorException('Please check server logs');

  }
}
