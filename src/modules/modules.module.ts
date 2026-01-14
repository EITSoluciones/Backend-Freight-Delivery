import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as ModuleEntity } from './entities/module.entity';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { AuthModule } from 'src/auth/auth.module';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity, ModuleCategory]), AuthModule],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}
