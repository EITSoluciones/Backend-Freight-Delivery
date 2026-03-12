import { DataSource } from 'typeorm';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';

export async function seedModuleCategories(dataSource: DataSource) {
  const repo = dataSource.getRepository(ModuleCategory);

  const categories: Partial<ModuleCategory>[] = [
    {
      uuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
      name: 'Administración',
      description: 'Módulos administrativos del sistema',
      is_active: true,
    },
    {
      uuid: '27904da2-8704-4455-9bda-9bf90714fc44',
      name: 'Datos Maestros',
      description: 'Catálogos y configuraciones base',
      is_active: true,
    },
  ];

  for (const item of categories) {
    const existing = await repo.findOneBy({ uuid: item.uuid! });

    if (existing) {
      repo.merge(existing, item);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(item));
    }
  }

  console.log('✔ Module Categories sembradas');
}