import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, Platform, Role]), 
  ]
})
export class UsersModule {}
