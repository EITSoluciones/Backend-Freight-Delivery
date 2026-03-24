import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { AddressesService } from 'src/addresses/addresses.service';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Customers')
@Controller({
  path: 'customers',
  version: '1',
})
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly addressesService: AddressesService,
  ) {}

  @Post()
  @Auth(Permissions.CustomersCreate)
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @GetUser() currentUser: User,
  ) {
    return this.customersService.create(createCustomerDto, currentUser);
  }

  @Get()
  @Auth(Permissions.CustomersView)
  findAll(@Query() queryCustomerDto: QueryCustomerDto) {
    return this.customersService.findAll(queryCustomerDto);
  }

  @Get(':uuid')
  @Auth(Permissions.CustomersView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.customersService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.CustomersUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @GetUser() currentUser: User,
  ) {
    return this.customersService.update(uuid, updateCustomerDto, currentUser);
  }

  @Delete(':uuid')
  @Auth(Permissions.CustomersDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.customersService.remove(uuid, currentUser);
  }

  @Post(':uuid/addresses')
  @Auth(Permissions.CustomersUpdate)
  addAddress(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() createAddressDto: CreateAddressDto,
    @GetUser() currentUser: User,
  ) {
    return this.addressesService.addAddressToCustomer(
      uuid,
      createAddressDto,
      currentUser,
    );
  }
}
