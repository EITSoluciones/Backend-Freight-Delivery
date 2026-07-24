import { Module, forwardRef } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { CustomersModule } from 'src/customers/customers.module';
import { LogsModule } from 'src/logs/logs.module';
import { AddressesRepository } from './repositories/addresses.repository';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository],
  imports: [
    TypeOrmModule.forFeature([Address]),
    forwardRef(() => CustomersModule),
    LogsModule,
  ],
  exports: [AddressesService, AddressesRepository],
})
export class AddressesModule {}
