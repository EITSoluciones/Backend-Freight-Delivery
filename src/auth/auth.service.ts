import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { password, username, platform } = loginUserDto;

    // Busca usuario
    const user = await this.usersRepository.findByUsernameForLogin(username);

    if (!user) throw new UnauthorizedException('Credenciales inválidas.');

    // Verificar que el usuario tenga acceso a la plataforma
    const platformEntity = user.platforms.find((p) => p.code === platform);
    if (!platformEntity)
      throw new UnauthorizedException('No tienes acceso a esta plataforma.');

    //Verificar que esté activo
    if (!user.is_active)
      throw new UnauthorizedException(
        'El usuario está bloqueado. Consulte con Administrador.',
      );

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales inválidas.');

    // Generar JWT token
    const accessToken = this.getAccessToken({ uuid: user.uuid });
    const refreshToken = this.getRefreshToken({ uuid: user.uuid });
    await this.saveRefreshToken(user.uuid, refreshToken, platformEntity.id);
    const { password: _, id: __, ...userWithoutPassword } = user;

    // Retornar respuesta estructurada
    return {
      message: 'Login de Usuario exitoso!',
      data: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRATION,
        user: {
          ...userWithoutPassword,
          platforms: user.platforms.map((p) => p.code),
          roles: user.roles.map((r) => ({
            uuid: r.uuid,
            code: r.code,
            name: r.name,
            description: r.description,
          })),
        },
      },
    };
  }

  async refreshAccessToken(
    oldRefreshToken: string,
  ): Promise<
    SuccessResponseDto<{ accessToken: string; refreshToken: string }>
  > {
    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const currentTokenEntity =
        await this.refreshTokensRepository.findByJtiAndUserUuid(
          payload.jti,
          payload.uuid,
        );
      if (!currentTokenEntity)
        throw new UnauthorizedException(
          'La sesión ha expirado o es inválida. Por favor, inicie sesión de nuevo.',
        );
      const accessToken = this.getAccessToken({ uuid: payload.uuid });
      const newRefreshToken = this.getRefreshToken({ uuid: payload.uuid });
      await this.refreshTokensRepository.deleteById(currentTokenEntity.id);
      await this.saveRefreshToken(
        payload.uuid,
        newRefreshToken,
        currentTokenEntity.platform_id,
      );
      return new SuccessResponseDto(true, 'Tokens renovados exitosamente', {
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'La sesión expiró. Por favor, inicie sesión de nuevo.',
        );
      }

      throw error;
    }
  }

  async revokeRefreshToken(
    refreshToken: string,
  ): Promise<SuccessResponseDto<null>> {
    try {
      const payload = this.jwtService.decode(refreshToken);

      if (!payload || !payload.uuid) {
        throw new UnauthorizedException('Token no válido');
      }

      const currentTokenEntity =
        await this.refreshTokensRepository.findByJtiAndUserUuid(
          payload.jti,
          payload.uuid,
        );
      if (currentTokenEntity) {
        await this.refreshTokensRepository.deleteById(currentTokenEntity.id);
      }

      return new SuccessResponseDto(true, 'Sesión cerrada exitosamente', null);
    } catch (error) {
      throw error;
    }
  }

  private getAccessToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload); //Genera Token
    return token;
  }

  private getRefreshToken(payload: JwtPayload) {
    const jti = crypto.randomUUID();
    return this.jwtService.sign(
      { ...payload, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      },
    );
  }

  private async saveRefreshToken(
    uuidUser: string,
    refreshToken: string,
    platformId: number,
  ) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const decoded = this.jwtService.decode(refreshToken);
    const expiresOnUtc = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokensRepository.deleteExpired(new Date());

    const entity = this.refreshTokensRepository.create({
      platform_id: platformId,
      token: tokenHash,
      uuid_user: uuidUser,
      jti: decoded?.jti,
      expires_on_utc: expiresOnUtc,
    });

    await this.refreshTokensRepository.save(entity);
  }
}
