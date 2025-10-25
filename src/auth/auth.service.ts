import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Platform } from 'src/platforms/entities/platform.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    private readonly jwtService: JwtService
  ) {

  }

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, platforms, ...userData } = createUserDto;

      const platformsIds = await this.findPlatformsByCode(platforms);

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        platforms: platformsIds
      });

      const savedUser = await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;

    } catch (error) {
      console.log("error");
      this.handleDBErrors(error);
    }

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
      relations: ['platforms'],
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
      expiresIn: Number(process.env.JWT_EXPIRATION),
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

  async findPlatformsByCode(codes: string[]): Promise<Platform[]> {


    const platformsIds = await this.platformRepository.find({
      where: { code: In(codes) },
    });


    const missingCodes = codes.filter(code => !platformsIds.some(p => p.code === code));
    console.log("codes:", missingCodes);

    if (missingCodes.length) throw new NotFoundException(`Plataformas no encontradas: ${missingCodes.join(', ')}`);

    return platformsIds;

  }



}
