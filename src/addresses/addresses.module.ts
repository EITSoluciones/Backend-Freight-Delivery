import { Module, forwardRef } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { CustomersModule } from 'src/customers/customers.module';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
  imports: [
    TypeOrmModule.forFeature([Address]),
    forwardRef(() => CustomersModule),
    LogsModule,
  ],
  exports: [AddressesService],
})
export class AddressesModule {}
