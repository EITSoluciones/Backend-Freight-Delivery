// src/database/seeds/module-category.seed.ts
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';
import { DataSource } from 'typeorm';

export async function seedModuleCategories(dataSource: DataSource) {
  const repo = dataSource.getRepository(ModuleCategory);

  const categories: Partial<ModuleCategory>[] = [
    {
      uuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
      name: 'Administración',
      description: 'Administración',
      is_active: true,
    },
    {
      uuid: '27904da2-8704-4455-9bda-9bf90714fc44',
      name: 'Datos Maestros',
      description: 'Datos Maestros de Sistema',
      is_active: true,
    },
  ];

  for (const category of categories) {
    await repo.upsert(category, ['uuid']);
  }

  console.log('✔ Module Categories sembradas');
}
