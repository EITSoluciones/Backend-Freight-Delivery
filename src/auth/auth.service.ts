import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { RefreshToken } from './entities/refresh-token.entity';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    @InjectRepository(Role)
    private readonly RoleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
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
        uuid: true,
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
    const platformEntity = user.platforms.find(p => p.code === platform);
    if (!platformEntity) throw new UnauthorizedException('No tienes acceso a esta plataforma.');

    //Verificar que esté activo
    if (!user.is_active) throw new UnauthorizedException('El usuario está bloqueado. Consulte con Administrador.');

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas.');


    // Generar JWT token
    const accessToken = this.getAccessToken({ uuid: user.uuid });
    const refreshToken = this.getRefreshToken({ uuid: user.uuid });
    await this.saveRefreshToken(user.uuid, refreshToken, platformEntity.id)
    const { password: _, id: __, ...userWithoutPassword } = user;

    // Retornar respuesta estructurada
    return {
      message: "Login de Usuario exitoso!",
      data: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRATION,
        user: {
          ...userWithoutPassword,
          platforms: user.platforms.map(p => p.code),
          roles: user.roles.map(r => ({
            uuid: r.uuid,
            code: r.code,
            name: r.name,
            description: r.description,
          }))
        },
      }
    };

  }


  async refreshAccessToken(oldRefreshToken: string):
    Promise<SuccessResponseDto<{ accessToken: string, refreshToken: string }>> {
    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const currentTokenEntity = await this.refreshTokenRepository.findOne({
        where: { jti: payload.jti, uuid_user: payload.uuid }
      });
      if (!currentTokenEntity) throw new ForbiddenException('La sesión ha expirado o es inválida. Por favor, inicie sesión de nuevo.');
      const accessToken = this.getAccessToken({ uuid: payload.uuid });
      const newRefreshToken = this.getRefreshToken({ uuid: payload.uuid });
      await this.refreshTokenRepository.delete(currentTokenEntity.id);
      await this.saveRefreshToken(payload.uuid, newRefreshToken, currentTokenEntity.platform_id);
      return new SuccessResponseDto(
        true,
        "Tokens renovados exitosamente",
        { accessToken, refreshToken: newRefreshToken }
      );
    } catch (error) {
      throw error;
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<SuccessResponseDto<null>> {
    try {
      const payload = this.jwtService.decode(refreshToken);

      if (!payload || !payload.uuid) {
        throw new UnauthorizedException('Token no válido');
      }

      const currentTokenEntity = await this.refreshTokenRepository.findOne({
        where: { jti: payload.jti, uuid_user: payload.uuid }
      });
      if (currentTokenEntity) {
        await this.refreshTokenRepository.delete(currentTokenEntity.id);
      }

      return new SuccessResponseDto(
        true,
        'Sesión cerrada exitosamente',
        null
      );
    } catch (error) {
      throw new UnauthorizedException('No se pudo procesar el cierre de sesión');
    }
  }

  private getAccessToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload); //Genera Token
    return token;
  }

  private getRefreshToken(payload: JwtPayload) {
    const jti = crypto.randomUUID();
    return this.jwtService.sign({ ...payload, jti }, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });
  }

  private async saveRefreshToken(uuidUser: string, refreshToken: string, platformId: number) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const decoded = this.jwtService.decode(refreshToken) as { exp?: number; jti: string } | null;
    const expiresOnUtc = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where("expires_on_utc < :now", { now: new Date() })
      .execute();

    const entity = this.refreshTokenRepository.create({
      platform_id: platformId,
      token: tokenHash,
      uuid_user: uuidUser,
      jti: decoded?.jti,
      expires_on_utc: expiresOnUtc,
    });

    await this.refreshTokenRepository.save(entity);
  }
}
