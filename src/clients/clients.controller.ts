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
  Put
} from '@nestjs/common';
import {
  ClientsService
} from './clients.service';
import {
  CreateClientDto
} from './dto/create-client.dto';
import {
  UpdateClientDto
} from './dto/update-client.dto';
import {
  QueryClientDto
} from './dto/query-client.dto';
import {
  AddressesService
} from 'src/addresses/addresses.service';
import {
  CreateAddressDto
} from 'src/addresses/dto/create-address.dto';
import {
  ApiTags
} from '@nestjs/swagger';

@ApiTags('Clients')
@Controller({
  path: 'clients',
  version: '1',
})
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly addressesService: AddressesService,
  ) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  findAll(@Query() queryClientDto: QueryClientDto) {
    return this.clientsService.findAll(queryClientDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.clientsService.findOne(uuid);
  }

  @Put(':uuid')
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(uuid, updateClientDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.clientsService.remove(uuid);
  }

  @Post(':uuid/addresses')
  addAddress(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.addAddressToClient(uuid, createAddressDto);
  }
}