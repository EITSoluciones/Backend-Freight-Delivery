import {
  Module,
  forwardRef
} from '@nestjs/common';
import {
  AddressesService
} from './addresses.service';
import {
  AddressesController
} from './addresses.controller';
import {
  TypeOrmModule
} from '@nestjs/typeorm';
import {
  Address
} from './entities/address.entity';
import {
  CustomersModule
} from 'src/customers/customers.module';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
  imports: [
    TypeOrmModule.forFeature([Address]),
    forwardRef(() =>CustomersModule
),
  ],
  exports: [AddressesService],
})
export class AddressesModule {}