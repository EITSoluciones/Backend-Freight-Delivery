import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliveryDriversService } from './delivery-drivers.service';
import { CreateDeliveryDriverDto } from './dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from './dto/update-delivery-driver.dto';

@Controller('delivery-drivers')
export class DeliveryDriversController {
  constructor(private readonly deliveryDriversService: DeliveryDriversService) {}

  @Post()
  create(@Body() createDeliveryDriverDto: CreateDeliveryDriverDto) {
    return this.deliveryDriversService.create(createDeliveryDriverDto);
  }

  @Get()
  findAll() {
    return this.deliveryDriversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryDriversService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliveryDriverDto: UpdateDeliveryDriverDto) {
    return this.deliveryDriversService.update(+id, updateDeliveryDriverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryDriversService.remove(+id);
  }
}
