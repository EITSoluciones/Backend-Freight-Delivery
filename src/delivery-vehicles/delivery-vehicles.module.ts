import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryCatalog } from 'src/delivery-catalogs/entities/delivery-catalog.entity';
import { DeliveryDriver } from 'src/delivery-drivers/entities/delivery-driver.entity';
import { LogsModule } from 'src/logs/logs.module';
import { DeliveryVehiclesController } from './delivery-vehicles.controller';
import { DeliveryVehiclesService } from './delivery-vehicles.service';
import { DeliveryVehicle } from './entities/delivery-vehicle.entity';
import { DeliveryDriversModule } from 'src/delivery-drivers/delivery-drivers.module';
import { DeliveryVehiclesRepository } from './repositories/delivery-vehicles.repository';
import { DeliveryCatalogsRepository } from 'src/delivery-catalogs/repositories/delivery-catalogs.repository';
import { DeliveryVehicleAssignment } from './entities/delivery-vehicle-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryVehicle,
      DeliveryVehicleAssignment,
      DeliveryDriver,
      DeliveryCatalog,
    ]),
    AuthModule,
    LogsModule,
    DeliveryDriversModule,
  ],
  controllers: [DeliveryVehiclesController],
  providers: [
    DeliveryVehiclesService,
    DeliveryVehiclesRepository,
    DeliveryCatalogsRepository,
  ],
})
export class DeliveryVehiclesModule {}
