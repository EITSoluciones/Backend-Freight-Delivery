import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';
import { RolesRepository } from './repositories/roles.repository';
import { UserRole } from 'src/users/entities/user-role.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  imports: [
    TypeOrmModule.forFeature([Role, Permission, UserRole]),
    AuthModule,
    LogsModule,
  ],
  exports: [RolesRepository],
})
export class RolesModule {}
