import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { DeliveryDriversService } from './delivery-drivers.service';
import { CreateDeliveryDriverDto } from './dto/create-delivery-driver.dto';
import { UpdateDeliveryDriverDto } from './dto/update-delivery-driver.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Delivery Drivers')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  path: 'delivery-drivers',
  version: '1',
})
export class DeliveryDriversController {
  constructor(
    private readonly deliveryDriversService: DeliveryDriversService,
  ) {}

  @Post()
  @Auth(Permissions.DeliveryDriversCreate)
  create(
    @Body() createDeliveryDriverDto: CreateDeliveryDriverDto,
    @GetUser() currentUser: User,
  ) {
    return this.deliveryDriversService.create(
      createDeliveryDriverDto,
      currentUser,
    );
  }

  @Get()
  @Auth(Permissions.DeliveryDriversView)
  findAll() {
    return this.deliveryDriversService.findAll();
  }

  @Get(':uuid')
  @Auth(Permissions.DeliveryDriversView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.deliveryDriversService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.DeliveryDriversUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateDeliveryDriverDto: UpdateDeliveryDriverDto,
    @GetUser() currentUser: User,
  ) {
    return this.deliveryDriversService.update(
      uuid,
      updateDeliveryDriverDto,
      currentUser,
    );
  }

  @Delete(':uuid')
  @Auth(Permissions.DeliveryDriversDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.deliveryDriversService.remove(uuid, currentUser);
  }
}
