import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly logsService: LogsService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Product>> {
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    await this.logsService.log(currentUser || null, {
      module: LogModule.PRODUCTS,
      action: LogAction.CREATE,
      entityUuid: savedProduct.uuid,
      entityName: savedProduct.nombre,
      description: `Producto creado: ${savedProduct.nombre}`,
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

    const bool = is_active === 'true';

    const where: any = {};
    if (bool !== undefined) {
      where.is_active = bool;
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return PaginatedResponse.create(
      products,
      total,
      page,
      limit,
      'Productos obtenidos exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Product>> {
    const product = await this.productRepository.findOne({ where: { uuid } });

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
    const productToUpdate = await this.productRepository.findOne({
      where: { uuid },
    });

    if (!productToUpdate) {
      throw new NotFoundException(`Producto con uuid ${uuid} no encontrado!`);
    }

    const oldData = { ...productToUpdate };

    Object.assign(productToUpdate, updateProductDto);
    const updatedProduct = await this.productRepository.save(productToUpdate);

    await this.logsService.log(currentUser || null, {
      module: LogModule.PRODUCTS,
      action: LogAction.UPDATE,
      entityUuid: updatedProduct.uuid,
      entityName: updatedProduct.nombre,
      description: `Producto actualizado: ${updatedProduct.nombre}`,
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
    const product = await this.productRepository.findOne({ where: { uuid } });

    if (!product) {
      throw new NotFoundException(`Producto con uuid ${uuid} no encontrado!`);
    }

    await this.productRepository.softDelete({ uuid });

    await this.logsService.log(currentUser || null, {
      module: LogModule.PRODUCTS,
      action: LogAction.DELETE,
      entityUuid: product.uuid,
      entityName: product.nombre,
      description: `Producto eliminado: ${product.nombre}`,
      oldData: { nombre: product.nombre, stock: product.stock },
    });

    return new SuccessResponseDto(
      true,
      'Producto eliminado exitosamente!',
      product,
    );
  }
}
