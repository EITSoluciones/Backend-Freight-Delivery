import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Center } from 'src/centers/entities/center.entity';
import { CentersRepository } from 'src/centers/repositories/centers.repository';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { DBErrorHandlerService } from 'src/common/database/db-error-handler.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validateImportRow } from 'src/common/import/import-field-validator';
import { ColumnMetadata } from 'src/common/interfaces/column-metadata.interface';
import { ImportRowError } from 'src/common/interfaces/import-row-error.interface';
import { Customer } from 'src/customers/entities/customer.entity';
import { CustomersRepository } from 'src/customers/repositories/customers.repository';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/users/entities/user.entity';
import { DeepPartial } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateImportOrderDto } from './dto/create-import-order.dto';
import { ImportOrdersDto } from './dto/import-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderPriority } from './enums/order-priority.enum';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './repositories/orders.repository';
import { ORDERS_IMPORT_METADATA } from './constants/orders-import-metadata';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly centersRepository: CentersRepository,
    private readonly logsService: LogsService,
    private readonly dbErrorHandler: DBErrorHandlerService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Order>> {
    const orderData = await this.getOrderData(createOrderDto);

    try {
      const order = this.ordersRepository.create(orderData);
      const savedOrder = await this.ordersRepository.save(order);
      const createdOrder = await this.getOrderByUuid(savedOrder.uuid);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ORDERS,
        action: LogAction.CREATE,
        description: `Pedido creado: ${createdOrder.order_number}. UUID: ${createdOrder.uuid}`,
        newData: createOrderDto,
      });

      return new SuccessResponseDto(
        true,
        'Pedido creado exitosamente!',
        createdOrder,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    const { limit = 10, page = 1 } = paginationDto;
    const [orders, total] = await this.ordersRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      orders,
      total,
      page,
      limit,
      'Pedidos obtenidos exitosamente!',
    );
  }

  async getOrdersCatalog(): Promise<
    SuccessResponseDto<{ uuid: string; order_number: string }[]>
  > {
    const orders = await this.ordersRepository.findActive();

    return new SuccessResponseDto(
      true,
      'Catálogo de pedidos obtenido exitosamente!',
      orders.map(({ uuid, order_number }) => ({ uuid, order_number })),
    );
  }

  async import(
    importOrdersDto: ImportOrdersDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Order[]>> {
    const ordersToImport = importOrdersDto.orders.map((order) => ({
      ...order,
      order_number: order.order_number?.toString().trim() ?? '',
      customer_code: order.customer_code?.toString().trim().toUpperCase() ?? '',
      origin_center_code: order.origin_center_code?.toString().trim().toUpperCase() ?? '',
    }));

    const errors: ImportRowError[] = [];
    const orderNumbersInFile = new Map<string, number>();

    ordersToImport.forEach((order, index) => {
      const row = index + 2;

      validateImportRow(order as Record<string, unknown>, row, ORDERS_IMPORT_METADATA, errors);

      // Duplicate order_number within the file
      if (order.order_number && order.order_number.length <= 100) {
        const firstRow = orderNumbersInFile.get(order.order_number);
        if (firstRow !== undefined) {
          errors.push({ row, field: 'order_number', value: order.order_number, observation: `El número "${order.order_number}" ya aparece en la fila ${firstRow}` });
        } else {
          orderNumbersInFile.set(order.order_number, row);
        }
      }

      // Cross-field: delivery window start must be before end
      if (order.delivery_window_start && order.delivery_window_end) {
        const start = new Date(String(order.delivery_window_start));
        const end = new Date(String(order.delivery_window_end));
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
          errors.push({ row, field: 'delivery_window_start', observation: 'La hora de inicio de la ventana de entrega debe ser anterior a la hora de fin' });
        }
      }
    });

    const uniqueOrderNumbers = [...orderNumbersInFile.keys()];
    const uniqueCustomerCodes = [
      ...new Set(ordersToImport.filter((o) => o.customer_code).map((o) => o.customer_code)),
    ];
    const uniqueCenterCodes = [
      ...new Set(ordersToImport.filter((o) => o.origin_center_code).map((o) => o.origin_center_code)),
    ];

    const [existingOrders, customers, centers] = await Promise.all([
      uniqueOrderNumbers.length
        ? this.ordersRepository.findByOrderNumbers(uniqueOrderNumbers)
        : Promise.resolve([]),
      uniqueCustomerCodes.length
        ? this.customersRepository.findByCodes(uniqueCustomerCodes)
        : Promise.resolve([]),
      uniqueCenterCodes.length
        ? this.centersRepository.findByCodes(uniqueCenterCodes)
        : Promise.resolve([]),
    ]);

    const existingOrderNumbersSet = new Set(existingOrders.map((o) => o.order_number));
    const customersByCode = new Map(customers.map((c) => [c.code, c]));
    const centersByCode = new Map(centers.map((c) => [c.code, c]));

    ordersToImport.forEach((order, index) => {
      const row = index + 2;

      // Solo reportar error de DB en la primera ocurrencia del número en el archivo
      if (order.order_number && orderNumbersInFile.get(order.order_number) === row && existingOrderNumbersSet.has(order.order_number)) {
        errors.push({ row, field: 'order_number', value: order.order_number, observation: `Ya existe un pedido con el número "${order.order_number}"` });
      }

      if (order.customer_code && !customersByCode.has(order.customer_code)) {
        errors.push({ row, field: 'customer_code', value: order.customer_code, observation: `No se encontró ningún cliente con el código "${order.customer_code}"` });
      }

      if (order.origin_center_code && !centersByCode.has(order.origin_center_code)) {
        errors.push({ row, field: 'origin_center_code', value: order.origin_center_code, observation: `No se encontró ningún centro con el código "${order.origin_center_code}"` });
      }
    });

    if (errors.length) {
      throw new BadRequestException({
        message: `Se encontraron ${errors.length} error${errors.length !== 1 ? 'es' : ''} en la carga. No se insertó ningún registro.`,
        errors: errors.sort((a, b) => a.row - b.row),
      });
    }

    const ordersToCreate = ordersToImport.map(({ customer_code, origin_center_code, ...orderData }) => ({
      ...orderData,
      customer_id: customersByCode.get(customer_code)!.id,
      origin_center_id: origin_center_code ? centersByCode.get(origin_center_code)!.id : null,
    }));

    try {
      const savedOrders = await this.ordersRepository.createMany(ordersToCreate);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ORDERS,
        action: LogAction.CREATE,
        description: `Carga masiva de pedidos: ${savedOrders.length} registros creados.`,
        newData: { count: savedOrders.length, order_numbers: uniqueOrderNumbers },
      });

      return new SuccessResponseDto(true, 'Pedidos cargados exitosamente!', savedOrders);
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  getImportTemplate(): SuccessResponseDto<{ orders: CreateImportOrderDto[]; metadata: ColumnMetadata[] }> {
    return new SuccessResponseDto(
      true,
      'Plantilla de pedidos obtenida exitosamente!',
      {
        metadata: ORDERS_IMPORT_METADATA,
        orders: [
          {
            order_number: 'PED-000001',
            order_date: '2026-01-01T09:00:00.000Z',
            customer_code: 'CLI-001',
            origin_center_code: 'CEDIS-001',
            delivery_date: '2026-01-02T13:00:00.000Z',
            priority: OrderPriority.MEDIUM,
            additional_notes: 'Entregar por acceso principal',
            price: 1250.5,
            volume: 1.25,
            weight: 350.75,
            delivery_window_start: '2026-01-02T09:00:00.000Z',
            delivery_window_end: '2026-01-02T13:00:00.000Z',
            recipient_name: 'María López',
            recipient_email: 'maria.lopez@example.com',
            recipient_phone: '5551234567',
            recipient_secondary_phone: '5559876543',
            latitude: 19.427,
            longitude: -99.1677,
            street: 'Avenida Reforma',
            internal_number: '12',
            external_number: '123',
            neighborhood: 'Juárez',
            district: 'Cuauhtémoc',
            city: 'Ciudad de México',
            state: 'Ciudad de México',
            country: 'México',
            postal_code: '06600',
            reference: 'Acceso por la puerta principal',
            is_active: true,
          },
        ],
      },
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Order>> {
    return new SuccessResponseDto(
      true,
      'Pedido encontrado!',
      await this.getOrderByUuid(uuid),
    );
  }

  async update(
    uuid: string,
    updateOrderDto: UpdateOrderDto,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Order>> {
    const order = await this.getOrderByUuid(uuid);
    const oldData = { ...order };
    const { customer_uuid, origin_center_uuid, ...orderData } = updateOrderDto;

    if (customer_uuid) {
      order.customer_id = (await this.getCustomerByUuid(customer_uuid)).id;
    }

    if (origin_center_uuid) {
      order.origin_center_id = (
        await this.getCenterByUuid(origin_center_uuid)
      ).id;
    }

    this.validateDeliveryWindow(
      orderData.delivery_window_start ?? order.delivery_window_start,
      orderData.delivery_window_end ?? order.delivery_window_end,
    );

    Object.assign(order, orderData);

    try {
      await this.ordersRepository.save(order);
      const updatedOrder = await this.getOrderByUuid(uuid);

      await this.logsService.log(currentUser || null, {
        module: LogModule.ORDERS,
        action: LogAction.UPDATE,
        description: `Pedido actualizado: ${updatedOrder.order_number}. UUID: ${updatedOrder.uuid}`,
        oldData,
        newData: updateOrderDto,
      });

      return new SuccessResponseDto(
        true,
        'Pedido actualizado exitosamente!',
        updatedOrder,
      );
    } catch (error) {
      this.dbErrorHandler.handleDBErrors(error);
    }
  }

  async remove(
    uuid: string,
    currentUser?: User,
  ): Promise<SuccessResponseDto<Order>> {
    const order = await this.getOrderByUuid(uuid);
    await this.ordersRepository.softDeleteByUuid(uuid);

    await this.logsService.log(currentUser || null, {
      module: LogModule.ORDERS,
      action: LogAction.DELETE,
      description: `Pedido eliminado: ${order.order_number}. UUID: ${order.uuid}`,
      oldData: { order_number: order.order_number },
    });

    return new SuccessResponseDto(
      true,
      'Pedido eliminado exitosamente!',
      order,
    );
  }

  private async getOrderByUuid(uuid: string): Promise<Order> {
    const order = await this.ordersRepository.findByUuid(uuid);

    if (!order) {
      throw new NotFoundException(`Pedido con uuid ${uuid} no encontrado!`);
    }

    return order;
  }

  private async getCustomerByUuid(uuid: string): Promise<Customer> {
    const customer = await this.customersRepository.findByUuid(uuid);

    if (!customer) {
      throw new NotFoundException(`Cliente con uuid ${uuid} no encontrado!`);
    }

    return customer;
  }

  private async getCenterByUuid(uuid: string): Promise<Center> {
    const center = await this.centersRepository.findByUuid(uuid);

    if (!center) {
      throw new NotFoundException(`Centro con uuid ${uuid} no encontrado!`);
    }

    return center;
  }

  private async getOrderData(
    createOrderDto: CreateOrderDto,
  ): Promise<DeepPartial<Order>> {
    const { customer_uuid, origin_center_uuid, ...orderData } = createOrderDto;
    const [customer, originCenter] = await Promise.all([
      this.getCustomerByUuid(customer_uuid),
      this.getCenterByUuid(origin_center_uuid),
    ]);

    this.validateDeliveryWindow(
      orderData.delivery_window_start,
      orderData.delivery_window_end,
    );

    return {
      ...orderData,
      customer_id: customer.id,
      origin_center_id: originCenter.id,
    };
  }

  private validateDeliveryWindow(
    start?: string | Date | null,
    end?: string | Date | null,
  ) {
    if (start && end && new Date(start) >= new Date(end)) {
      throw new BadRequestException(
        'La hora de inicio debe ser anterior a la hora de fin de la ventana de entrega.',
      );
    }
  }
}
