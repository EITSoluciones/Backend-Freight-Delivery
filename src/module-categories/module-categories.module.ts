import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleCategory } from './entities/module-category.entity';
import { ModuleCategoriesController } from './module-categories.controller';
import { ModuleCategoriesService } from './module-categories.service';
import { AuthModule } from 'src/auth/auth.module';
import { ModuleCategoriesRepository } from './repositories/module-categories.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleCategory]), AuthModule],
  controllers: [ModuleCategoriesController],
  providers: [ModuleCategoriesService, ModuleCategoriesRepository],
  exports: [ModuleCategoriesRepository],
})
export class ModuleCategoriesModule {}
