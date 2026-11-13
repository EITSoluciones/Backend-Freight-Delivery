import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleCategory } from './entities/module-category.entity';
import { ModuleCategoriesController } from './module-categories.controller';
import { ModuleCategoriesService } from './module-categories.service';
import { AuthModule } from 'src/auth/auth.module';
import { ModuleCategoriesRepository } from './repositories/module-categories.repository';
import { ModulesRepository } from 'src/module-categories/repositories/modules.repository';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { Module as ModuleEntity } from './entities/module.entity';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleCategory, ModuleEntity]), AuthModule, LogsModule],
  controllers: [ModulesController, ModuleCategoriesController],
  providers: [
    ModulesService,
    ModulesRepository,
    ModuleCategoriesService,
    ModuleCategoriesRepository,
  ],
  exports: [ModuleCategoriesRepository],
})
export class ModuleCategoriesModule {}
