import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ImportOrdersDto } from './dto/import-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Auth(Permissions.OrdersCreate)
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() currentUser: User) {
    return this.ordersService.create(createOrderDto, currentUser);
  }

  @Post('import')
  @Auth(Permissions.OrdersCreate)
  import(
    @Body() importOrdersDto: ImportOrdersDto,
    @GetUser() currentUser: User,
  ) {
    return this.ordersService.import(importOrdersDto, currentUser);
  }

  @Get('import-template')
  @Auth(Permissions.OrdersCreate)
  getImportTemplate() {
    return this.ordersService.getImportTemplate();
  }

  @Get('catalog')
  @Auth(Permissions.OrdersView)
  getOrdersCatalog() {
    return this.ordersService.getOrdersCatalog();
  }

  @Get()
  @Auth(Permissions.OrdersView)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @Get(':uuid')
  @Auth(Permissions.OrdersView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.ordersService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.OrdersUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser() currentUser: User,
  ) {
    return this.ordersService.update(uuid, updateOrderDto, currentUser);
  }

  @Delete(':uuid')
  @Auth(Permissions.OrdersDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.ordersService.remove(uuid, currentUser);
  }
}
