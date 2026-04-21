import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { User } from 'src/users/entities/user.entity';
import { CreateDeliveryVehicleDto } from './dto/create-delivery-vehicle.dto';
import { QueryDeliveryVehicleDto } from './dto/query-delivery-vehicle.dto';
import { UpdateDeliveryVehicleDto } from './dto/update-delivery-vehicle.dto';
import { DeliveryVehiclesService } from './delivery-vehicles.service';

@ApiTags('Delivery Vehicles')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  path: 'delivery-vehicles',
  version: '1',
})
export class DeliveryVehiclesController {
  constructor(
    private readonly deliveryVehiclesService: DeliveryVehiclesService,
  ) {}

  @Post()
  @Auth(Permissions.DeliveryVehiclesCreate)
  create(
    @Body() createDeliveryVehicleDto: CreateDeliveryVehicleDto,
    @GetUser() currentUser: User,
  ) {
    return this.deliveryVehiclesService.create(
      createDeliveryVehicleDto,
      currentUser,
    );
  }

  @Get()
  @Auth(Permissions.DeliveryVehiclesView)
  findAll(@Query() queryDto: QueryDeliveryVehicleDto) {
    return this.deliveryVehiclesService.findAll(queryDto);
  }

  @Get(':uuid')
  @Auth(Permissions.DeliveryVehiclesView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.deliveryVehiclesService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.DeliveryVehiclesUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateDeliveryVehicleDto: UpdateDeliveryVehicleDto,
    @GetUser() currentUser: User,
  ) {
    return this.deliveryVehiclesService.update(
      uuid,
      updateDeliveryVehicleDto,
      currentUser,
    );
  }

  @Delete(':uuid')
  @Auth(Permissions.DeliveryVehiclesDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.deliveryVehiclesService.remove(uuid, currentUser);
  }
}
