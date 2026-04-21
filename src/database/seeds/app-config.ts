import { DataSource } from 'typeorm';
import { AppConfig } from 'src/app-config/entities/app-config.entity';
import { v4 as uuidv4 } from 'uuid';

type AppConfigSeed = {
  uuid: string;
  key: string;
  value: string;
  type: string;
  description: string;
  is_public: boolean;
  is_active: boolean;
};

export async function seedAppConfig(dataSource: DataSource) {
  const repo = dataSource.getRepository(AppConfig);

  const configs: AppConfigSeed[] = [
    {
      uuid: uuidv4(),
      key: 'app_name',
      value: 'Freight Delivery',
      type: 'string',
      description: 'Nombre de la aplicación',
      is_public: true,
      is_active: true,
    },
    {
      uuid: uuidv4(),
      key: 'app_description',
      value: 'Sistema de gestión de entregas y logística',
      type: 'string',
      description: 'Descripción de la aplicación',
      is_public: true,
      is_active: true,
    },
    {
      uuid: uuidv4(),
      key: 'logo',
      value: '',
      type: 'string',
      description: 'Logo principal de la aplicación',
      is_public: true,
      is_active: true,
    },
    {
      uuid: uuidv4(),
      key: 'favicon',
      value: '',
      type: 'string',
      description: 'Favicon de la aplicación',
      is_public: true,
      is_active: true,
    },
    {
      uuid: uuidv4(),
      key: 'primary_color',
      value: '#0050F5',
      type: 'string',
      description: 'Color primario de la aplicación',
      is_public: true,
      is_active: true,
    },
    {
      uuid: uuidv4(),
      key: 'activation_code',
      value: 'MASTER2024',
      type: 'string',
      description: 'Código maestro de activación',
      is_public: false,
      is_active: true,
    },
    {
      uuid: uuidv4(),
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      description: 'Modo mantenimiento de la aplicación',
      is_public: true,
      is_active: true,
    },
  ];

  for (const item of configs) {
    const existing = await repo.findOne({
      where: { key: item.key },
    });

    if (existing) {
      repo.merge(existing, item);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(item));
    }
  }

  console.log('✔ App Config sembrados');
}
