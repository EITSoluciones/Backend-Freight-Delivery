import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  PaginatedResponse,
  SuccessResponseDto,
} from 'src/common/dto/success-response.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationChannel } from './enums/notification-channel.enum';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly twilioService: TwilioService,
  ) { }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<SuccessResponseDto<Notification>> {
    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      code: createNotificationDto.code.toUpperCase(),
    });
    const savedNotification =
      await this.notificationsRepository.save(notification);

    return new SuccessResponseDto(
      true,
      'Notificación creada exitosamente!',
      savedNotification,
    );
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Notification>> {
    const { limit = 10, page = 1 } = paginationDto;
    const [notifications, total] =
      await this.notificationsRepository.findAll(paginationDto);

    return PaginatedResponse.create(
      notifications,
      total,
      page,
      limit,
      'Notificaciones obtenidas exitosamente!',
    );
  }

  async findOne(uuid: string): Promise<SuccessResponseDto<Notification>> {
    const notification = await this.getByUuid(uuid);
    return new SuccessResponseDto(
      true,
      'Notificación encontrada!',
      notification,
    );
  }

  async update(
    uuid: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<SuccessResponseDto<Notification>> {
    const notification = await this.getByUuid(uuid);
    Object.assign(notification, updateNotificationDto);

    if (updateNotificationDto.code) {
      notification.code = updateNotificationDto.code.toUpperCase();
    }

    const updatedNotification =
      await this.notificationsRepository.save(notification);
    return new SuccessResponseDto(
      true,
      'Notificación actualizada exitosamente!',
      updatedNotification,
    );
  }

  async remove(uuid: string): Promise<SuccessResponseDto<Notification>> {
    const notification = await this.getByUuid(uuid);
    await this.notificationsRepository.softDeleteByUuid(uuid);

    return new SuccessResponseDto(
      true,
      'Notificación eliminada exitosamente!',
      notification,
    );
  }

  async getActiveByUuid(uuid: string): Promise<Notification> {
    const notification =
      await this.notificationsRepository.findActiveByUuid(uuid);

    if (!notification) {
      throw new NotFoundException(
        `Notificación activa con uuid ${uuid} no encontrada!`,
      );
    }

    return notification;
  }

  async getByCode(code: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findByCode(
      code,
    );

    if (!notification) {
      throw new NotFoundException(
        `Notificación activa con código ${code} no encontrada!`,
      );
    }

    return notification;
  }

  renderContent(
    content: string,
    parameters: Record<string, string | number>,
  ): string {
    return content.replace(/\{([^{}]+)\}/g, (placeholder, key: string) => {
      const value = parameters[key];

      if (value === undefined || value === null) {
        throw new BadRequestException(
          `Falta el parámetro ${placeholder} para enviar la notificación`,
        );
      }

      return String(value);
    });
  }

  async sendNotification(
    notificationCode: string,
    countryCode: string,
    phone: string,
    parameters: Record<string, string | number>,
  ) {
    const notification = await this.getByCode(notificationCode);

    let messagingServiceSid = '';
    switch (notification.channel) {
      case NotificationChannel.SMS:
        messagingServiceSid =
          process.env.TWILIO_MESSAGING_SERVICE_SID ?? ''
    }
    const content = this.renderContent(notification.content, parameters);
    phone = this.formatPhone(phone, countryCode);
    const response = await this.twilioService.send(
      phone,
      content,
      messagingServiceSid,
    );

    return { notification, content, response };
  }

  private async getByUuid(uuid: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findByUuid(uuid);

    if (!notification) {
      throw new NotFoundException(
        `Notificación con uuid ${uuid} no encontrada!`,
      );
    }

    return notification;
  }

  private formatPhone(phone: string, countryCode: string): string {
    if (phone.startsWith('+')) {
      return phone;
    }

    return `+${countryCode.replace(/\D/g, '')}${phone.replace(/\D/g, '')}`;
  }
}
