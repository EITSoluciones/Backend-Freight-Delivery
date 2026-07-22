import { Module } from '@nestjs/common';
import { DeliveryDriversService } from './delivery-drivers.service';
import { DeliveryDriversController } from './delivery-drivers.controller';
import { DeliveryDriver } from './entities/delivery-driver.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryCatalog } from 'src/delivery-catalogs/entities/delivery-catalog.entity';
import { LogsModule } from 'src/logs/logs.module';
import { UsersModule } from 'src/users/users.module';
import { DeliveryDriversRepository } from './repositories/delivery-drivers.repository';
import { DeliveryCatalogsRepository } from 'src/delivery-catalogs/repositories/delivery-catalogs.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryDriver, DeliveryCatalog]),
    AuthModule,
    LogsModule,
    UsersModule,
  ],
  controllers: [DeliveryDriversController],
  providers: [
    DeliveryDriversService,
    DeliveryDriversRepository,
    DeliveryCatalogsRepository,
  ],
  exports: [DeliveryDriversService, DeliveryDriversRepository],
})
export class DeliveryDriversModule {}
