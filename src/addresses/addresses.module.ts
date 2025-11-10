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
  ClientsModule
} from 'src/clients/clients.module';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
  imports: [
    TypeOrmModule.forFeature([Address]),
    forwardRef(() => ClientsModule),
  ],
  exports: [AddressesService],
})
export class AddressesModule {}