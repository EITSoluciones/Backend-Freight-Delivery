import { Module } from '@nestjs/common';
import { DeliveryDriversService } from './delivery-drivers.service';
import { DeliveryDriversController } from './delivery-drivers.controller';
import { DeliveryDriver } from './entities/delivery-driver.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryCatalog } from 'src/delivery-catalogs/entities/delivery-catalog.entity';
import { DeliveryVehicle } from 'src/delivery-vehicles/entities/delivery-vehicle.entity';
import { LogsModule } from 'src/logs/logs.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryDriver,
      DeliveryVehicle,
      DeliveryCatalog,
    ]),
    AuthModule,
    LogsModule,
    UsersModule,
  ],
  controllers: [DeliveryDriversController],
  providers: [DeliveryDriversService],
})
export class DeliveryDriversModule {}