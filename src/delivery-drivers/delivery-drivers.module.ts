import { Module } from '@nestjs/common';
import { DeliveryDriversService } from './delivery-drivers.service';
import { DeliveryDriversController } from './delivery-drivers.controller';
import { DeliveryDriver } from './entities/delivery-driver.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';
import { User } from 'src/users/entities/user.entity';
import { DeliveryVehicle } from 'src/delivery-vehicles/entities/delivery-vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryDriver, DeliveryVehicle, User]),
    AuthModule,
    LogsModule,
  ],
  controllers: [DeliveryDriversController],
  providers: [DeliveryDriversService],
})
export class DeliveryDriversModule {}
