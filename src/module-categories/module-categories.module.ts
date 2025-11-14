import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleCategory } from './entities/module-category.entity';
import { ModuleCategoriesController } from './module-categories.controller';
import { ModuleCategoriesService } from './module-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleCategory])],
  controllers: [ModuleCategoriesController],
  providers: [ModuleCategoriesService],
})
export class ModuleCategoriesModule {}
