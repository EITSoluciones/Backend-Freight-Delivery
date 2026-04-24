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
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { User } from './entities/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Usuarios')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('search')
  searchUsers(
    @Query('email') email?: string,
    @Query('username') username?: string,
  ) {
    return this.usersService.search(email, username);
  }

  @Post()
  @Auth(Permissions.UsersCreate)
  create(@Body() createUserDto: CreateUserDto, @GetUser() currentUser: User) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @Auth(Permissions.UsersView)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':uuid')
  @Auth(Permissions.UsersView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.UsersUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.partialUpdate(uuid, updateUserDto, currentUser);
  }

  @Delete(':uuid')
  @Auth(Permissions.UsersDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.remove(uuid, currentUser);
  }


  @Get('by-role/:roleCode')
  @Auth()
  getUsersWithRoleDelivery(
    @Param('roleCode') roleCode: string,
  ) {
    return this.usersService.getUsersByRole(roleCode);
  }
}
