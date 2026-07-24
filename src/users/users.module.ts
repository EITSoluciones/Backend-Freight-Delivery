import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';
import { UsersRepository } from './repositories/users.repository';
import { UserRole } from './entities/user-role.entity';
import { PlatformsRepository } from 'src/platforms/repositories/platforms.repository';
import { RolesRepository } from 'src/roles/repositories/roles.repository';
import { Permission } from 'src/roles/entities/permission.entity';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    PlatformsRepository,
    RolesRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Platform, Role, Permission]),
    AuthModule,
    LogsModule,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
