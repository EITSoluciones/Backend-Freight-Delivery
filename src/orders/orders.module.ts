import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentersModule } from 'src/centers/centers.module';
import { CustomersModule } from 'src/customers/customers.module';
import { LogsModule } from 'src/logs/logs.module';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    CentersModule,
    CustomersModule,
    LogsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
