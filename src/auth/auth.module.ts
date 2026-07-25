import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UserRole } from 'src/users/entities/user-role.entity';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { HttpModule } from '@nestjs/axios';
import { LicenseValidationService } from './services/license-validation.service';
import { AppConfigModule } from 'src/app-config/app-config.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UsersRepository,
    RefreshTokensRepository,
    LicenseValidationService,
  ],
  imports: [
    ConfigModule,
    HttpModule,
    AppConfigModule,
    TypeOrmModule.forFeature([User, UserRole, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        return {
          secret: 's3cr3tjwt2025',
          signOptions: {
            expiresIn: process.env.JWT_EXPIRATION,
          },
        };
      },
    }),
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    LicenseValidationService,
  ],
})
export class AuthModule {}
