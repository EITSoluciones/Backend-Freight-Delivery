import { DataSource } from 'typeorm';
import { ShipmentStatus } from 'src/shipments/entities/shipment-status.entity';

export async function seedShipmentStatuses(dataSource: DataSource) {
  const repo = dataSource.getRepository(ShipmentStatus);

  const statuses: Partial<ShipmentStatus>[] = [
    { code: 'CREATED', name: 'Creado', sort_order: 1, is_active: true },
    { code: 'ASSIGNED', name: 'Asignado', sort_order: 2, is_active: true },
    { code: 'PICKED_UP', name: 'Recolectado', sort_order: 3, is_active: true },
    { code: 'IN_TRANSIT', name: 'En tránsito', sort_order: 4, is_active: true },
    { code: 'DELIVERED', name: 'Entregado', sort_order: 5, is_active: true },
    { code: 'CANCELLED', name: 'Cancelado', sort_order: 6, is_active: true },
  ];

  for (const item of statuses) {
    const existing = await repo.findOneBy({ code: item.code! });

    if (existing) {
      repo.merge(existing, item);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(item));
    }
  }

  console.log('✔ Shipment statuses sembrados');
}
