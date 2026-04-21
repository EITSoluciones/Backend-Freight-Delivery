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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { Permissions } from 'src/auth/interfaces';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Products')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(Permissions.ProductsCreate)
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() currentUser: User,
  ) {
    return this.productsService.create(createProductDto, currentUser);
  }

  @Get()
  @Auth(Permissions.ProductsView)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':uuid')
  @Auth(Permissions.ProductsView)
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.productsService.findOne(uuid);
  }

  @Patch(':uuid')
  @Auth(Permissions.ProductsUpdate)
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() currentUser: User,
  ) {
    return this.productsService.update(uuid, updateProductDto, currentUser);
  }

  @Delete(':uuid')
  @Auth(Permissions.ProductsDelete)
  remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @GetUser() currentUser: User,
  ) {
    return this.productsService.remove(uuid, currentUser);
  }
}
