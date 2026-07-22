import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { LogsModule } from 'src/logs/logs.module';
import { ProductsRepository } from './repositories/products.repository';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  imports: [TypeOrmModule.forFeature([Product]), LogsModule],
})
export class ProductsModule {}
