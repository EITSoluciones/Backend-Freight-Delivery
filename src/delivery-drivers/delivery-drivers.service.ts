import { Injectable } from '@nestjs/common';
import { CreateDeliveryDriverDto } from './dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from './dto/update-delivery-driver.dto';

@Injectable()
export class DeliveryDriversService {
  create(createDeliveryDriverDto: CreateDeliveryDriverDto) {
    return 'This action adds a new deliveryDriver';
  }

  findAll() {
    return `This action returns all deliveryDrivers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliveryDriver`;
  }

  update(id: number, updateDeliveryDriverDto: UpdateDeliveryDriverDto) {
    return `This action updates a #${id} deliveryDriver`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliveryDriver`;
  }
}
