import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryCatalog } from 'src/delivery-catalogs/entities/delivery-catalog.entity';
import { DeliveryDriver } from 'src/delivery-drivers/entities/delivery-driver.entity';
import { LogsModule } from 'src/logs/logs.module';
import { DeliveryVehiclesController } from './delivery-vehicles.controller';
import { DeliveryVehiclesService } from './delivery-vehicles.service';
import { DeliveryVehicle } from './entities/delivery-vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryVehicle,
      DeliveryDriver,
      DeliveryCatalog,
    ]),
    AuthModule,
    LogsModule,
  ],
  controllers: [DeliveryVehiclesController],
  providers: [DeliveryVehiclesService],
})
export class DeliveryVehiclesModule {}
