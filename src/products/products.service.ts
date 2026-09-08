import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  SuccessResponseDto,
  PaginatedResponse,
} from '../common/dto/success-response.dto';
import { Product } from './entities/product.entity';
import { LogsService } from 'src/logs/logs.service';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { User } from 'src/users/entities/user.entity';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Product>> {
    const product = this.productsRepository.create(createProductDto);
    const savedProduct = await this.productsRepository.save(product);

    await this.logsService.log(currentUser || null, {
      module: LogModule.PRODUCTS,
      action: LogAction.CREATE,
      description: `Producto creado: ${savedProduct.nombre}. UUID: ${savedProduct.uuid}`,
      newData: { nombre: savedProduct.nombre, stock: savedProduct.stock },
    });

    return new SuccessResponseDto(
      true,
      'Producto creado exitosamente!',
      savedProduct,
    );
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Product>> {
    const { limit = 10, page = 1, is_active } = paginationDto;

    const [products, total] =
      await this.productsRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      products,
      total,
      page,
      limit,
      'Productos obtenidos exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Product>> {
    const product = await this.productsRepository.findByUuid(uuid);

    if (!product) {
      throw new NotFoundException(`Producto con uuid ${uuid} no encontrado!`);
    }

    return new SuccessResponseDto(true, 'Producto encontrado!', product);
  }

  async update(
    uuid: string,
    updateProductDto: UpdateProductDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Product>> {
    const productToUpdate = await this.productsRepository.findByUuid(uuid);

    if (!productToUpdate) {
      throw new NotFoundException(`Producto con uuid ${uuid} no encontrado!`);
    }

    const oldData = { ...productToUpdate };

    Object.assign(productToUpdate, updateProductDto);
    const updatedProduct = await this.productsRepository.save(productToUpdate);

    await this.logsService.log(currentUser || null, {
      module: LogModule.PRODUCTS,
      action: LogAction.UPDATE,
      description: `Producto actualizado: ${updatedProduct.nombre}. UUID: ${updatedProduct.uuid}`,
      oldData,
      newData: updateProductDto,
    });

    return new SuccessResponseDto(
      true,
      'Producto actualizado exitosamente!',
      updatedProduct,
    );
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Product>> {
    const product = await this.productsRepository.findByUuid(uuid);

    if (!product) {
      throw new NotFoundException(`Producto con uuid ${uuid} no encontrado!`);
    }

    await this.productsRepository.softDeleteByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.PRODUCTS,
      action: LogAction.DELETE,
      description: `Producto eliminado: ${product.nombre}. UUID: ${product.uuid}`,
      oldData: { nombre: product.nombre, stock: product.stock },
    });

    return new SuccessResponseDto(
      true,
      'Producto eliminado exitosamente!',
      product,
    );
  }
}
