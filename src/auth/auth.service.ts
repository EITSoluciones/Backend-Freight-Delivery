import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dto';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(Role)
    private readonly RoleRepository: Repository<Role>,
    private readonly jwtService: JwtService
  ) {

  }

  async login(loginUserDto: LoginUserDto) {

    const { password, username, platform } = loginUserDto;

    // Busca usuario
    const user = await this.userRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        last_name: true,
        password: true,
        is_active: true,
      },
      relations: ['platforms', 'roles'],
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas.');

    // Verificar que el usuario tenga acceso a la plataforma
    const hasPlatform = user.platforms.some(p => p.code === platform);
    if (!hasPlatform) throw new UnauthorizedException('No tienes acceso a esta plataforma.');

    //Verificar que esté activo
    if (!user.is_active) throw new UnauthorizedException('El usuario está bloqueado. Consulte con Administrador.');

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas.');

    // Generar JWT token
    const accessToken = this.getJwtToken({ id: user.id });

    const { password: _, ...userWithoutPassword } = user;

    // Retornar respuesta estructurada
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRATION,
      user: {
        ...userWithoutPassword,
        platforms: user.platforms.map(p => p.code),
      },
    };


  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload); //Genera Token
    return token;
  }


}
