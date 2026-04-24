import { DataSource } from 'typeorm';
import { DeliveryCatalog } from 'src/delivery-catalogs/entities/delivery-catalog.entity';

type DeliveryCatalogSeed = {
  uuid: string;
  category: string;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
};

export async function seedDeliveryCatalogs(dataSource: DataSource) {
  const repo = dataSource.getRepository(DeliveryCatalog);

  const items: DeliveryCatalogSeed[] = [
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111001',
      category: 'driver_profile',
      code: 'default',
      name: 'Perfil por defecto',
      sort_order: 1,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111002',
      category: 'driver_type',
      code: 'internal',
      name: 'Interno',
      sort_order: 1,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111003',
      category: 'driver_type',
      code: 'external',
      name: 'Externo',
      sort_order: 2,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111004',
      category: 'license_type',
      code: 'automovilista',
      name: 'Automovilista',
      sort_order: 1,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111005',
      category: 'license_type',
      code: 'chofer',
      name: 'Chofer',
      sort_order: 2,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111006',
      category: 'license_type',
      code: 'moto',
      name: 'Moto',
      sort_order: 3,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111007',
      category: 'document_type',
      code: 'curp',
      name: 'CURP',
      sort_order: 1,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111008',
      category: 'document_type',
      code: 'rfc',
      name: 'RFC',
      sort_order: 2,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111009',
      category: 'document_type',
      code: 'dni',
      name: 'DNI',
      sort_order: 3,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111010',
      category: 'document_type',
      code: 'passport',
      name: 'Pasaporte',
      sort_order: 4,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111011',
      category: 'document_type',
      code: 'ine',
      name: 'INE',
      sort_order: 5,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111012',
      category: 'driver_status',
      code: 'active',
      name: 'Activo',
      sort_order: 1,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111013',
      category: 'driver_status',
      code: 'inactive',
      name: 'Inactivo',
      sort_order: 2,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111014',
      category: 'driver_status',
      code: 'suspended',
      name: 'Suspendido',
      sort_order: 3,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111015',
      category: 'vehicle_type',
      code: 'motorcycle',
      name: 'Motocicleta',
      sort_order: 1,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111016',
      category: 'vehicle_type',
      code: 'car',
      name: 'Automovil',
      sort_order: 2,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111017',
      category: 'vehicle_type',
      code: 'van',
      name: 'Van',
      sort_order: 3,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111018',
      category: 'vehicle_type',
      code: 'truck',
      name: 'Camioneta',
      sort_order: 4,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111019',
      category: 'vehicle_type',
      code: 'bicycle',
      name: 'Bicicleta',
      sort_order: 5,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111020',
      category: 'vehicle_status',
      code: 'active',
      name: 'Activo',
      sort_order: 1,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111021',
      category: 'vehicle_status',
      code: 'maintenance',
      name: 'Mantenimiento',
      sort_order: 2,
      is_active: true,
    },
    {
      uuid: '84f50d23-5857-4b91-b36b-111111111022',
      category: 'vehicle_status',
      code: 'inactive',
      name: 'Inactivo',
      sort_order: 3,
      is_active: true,
    },
  ];

  for (const item of items) {
    const existing = await repo.findOne({
      where: {
        category: item.category,
        code: item.code,
      },
    });

    if (existing) {
      repo.merge(existing, item);
      await repo.save(existing);
      continue;
    }

    await repo.save(repo.create(item));
  }

  console.log('✔ Delivery catalogos sembrados');
}
