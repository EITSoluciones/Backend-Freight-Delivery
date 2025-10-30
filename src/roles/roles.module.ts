import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
      imports:[
        TypeOrmModule.forFeature([ Role, Permission ])
      ]
})
export class RolesModule {}
