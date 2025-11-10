import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  AddressesService
} from './addresses.service';
import {
  UpdateAddressDto
} from './dto/update-address.dto';
import {
  ApiTags
} from '@nestjs/swagger';

@ApiTags('Addresses')
@Controller({
  path: 'addresses',
  version: '1',
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Patch(':uuid')
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(uuid, updateAddressDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.addressesService.remove(uuid);
  }
}