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
import { Customer } from 'src/customers/entities/customer.entity';
import { CustomersRepository } from 'src/customers/repositories/customers.repository';
import { LogAction } from 'src/logs/enums/log-action.enum';
import { LogModule } from 'src/logs/enums/log-module.enum';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './repositories/orders.repository';

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
    const { customer_uuid, origin_center_uuid, ...orderData } = createOrderDto;
    const customer = await this.getCustomerByUuid(customer_uuid);
    const originCenter = origin_center_uuid
      ? await this.getCenterByUuid(origin_center_uuid)
      : undefined;

    this.validateDeliveryWindow(
      orderData.delivery_window_start,
      orderData.delivery_window_end,
    );

    try {
      const order = this.ordersRepository.create({
        ...orderData,
        customer_id: customer.id,
        origin_center_id: originCenter?.id,
      });
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
