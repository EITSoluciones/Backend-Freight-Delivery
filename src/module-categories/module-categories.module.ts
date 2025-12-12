import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleCategory } from './entities/module-category.entity';
import { ModuleCategoriesController } from './module-categories.controller';
import { ModuleCategoriesService } from './module-categories.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleCategory]), AuthModule],
  controllers: [ModuleCategoriesController],
  providers: [ModuleCategoriesService],
})
export class ModuleCategoriesModule { }
