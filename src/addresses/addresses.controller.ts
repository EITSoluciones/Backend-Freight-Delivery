import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Addresses')
@Controller({
  path: 'addresses',
  version: '1',
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Patch(':uuid')
  @Auth(Permissions.AddressesUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @GetUser() currentUser: User,
  ) {
    return this.addressesService.update(uuid, updateAddressDto, currentUser);
  }

  @Delete(':uuid')
  @Auth(Permissions.AddressesDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.addressesService.remove(uuid, currentUser);
  }
}
