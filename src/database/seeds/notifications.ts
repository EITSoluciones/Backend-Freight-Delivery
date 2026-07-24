import { DataSource } from 'typeorm';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationChannel } from 'src/notifications/enums/notification-channel.enum';

export async function seedNotifications(dataSource: DataSource) {
  const repository = dataSource.getRepository(Notification);
  const notifications: Partial<Notification>[] = [
    {
      uuid: '4f16cb8e-9f98-4c5f-88ca-102a1c000001',
      code: 'DELIVERY_DRIVER_INVITATION',
      name: 'Invitación a repartidor',
      channel: NotificationChannel.SMS,
      content:
        'Hola {param0}, te invitamos a instalar la app Freight Delivery: https://freight-delivery.eitsoluciones.com.mx',
      description: 'Invitación para que un repartidor instale la aplicación',
      is_global: true,
      is_active: true,
    },
  ];

  for (const item of notifications) {
    const existing = await repository.findOneBy({ code: item.code! });

    if (existing) {
      repository.merge(existing, item);
      await repository.save(existing);
    } else {
      await repository.save(repository.create(item));
    }
  }

  console.log('Notifications sembradas');
}
