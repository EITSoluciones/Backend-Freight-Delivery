import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { AddressesModule } from 'src/addresses/addresses.module';
import { Address } from 'src/addresses/entities/address.entity';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  imports: [
    TypeOrmModule.forFeature([Customer, Address]),
    AddressesModule,
    LogsModule,
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
