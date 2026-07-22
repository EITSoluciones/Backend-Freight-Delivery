import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentEvent } from './entities/shipment-event.entity';
import { ShipmentStatus } from './entities/shipment-status.entity';
import { Shipment } from './entities/shipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentEvent, ShipmentStatus]),
  ],
  exports: [TypeOrmModule],
})
export class ShipmentsModule {}
