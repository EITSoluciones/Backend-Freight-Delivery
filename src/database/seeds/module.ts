import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';
import { Module } from 'src/modules/entities/module.entity';
import { DataSource } from 'typeorm';

export async function seedModules(dataSource: DataSource) {
  const moduleRepo = dataSource.getRepository(Module);
  const categoryRepo = dataSource.getRepository(ModuleCategory);

  // Resolver categorías por UUID
  const adminCategory = await categoryRepo.findOneByOrFail({
    uuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
  });

  const masterDataCategory = await categoryRepo.findOneByOrFail({
    uuid: '27904da2-8704-4455-9bda-9bf90714fc44',
  });

  const modules: Partial<Module>[] = [
    {
      uuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
      name: 'Usuarios',
      description: 'usuarios',
      icon: 'prueba',
      url: 'users',
      is_active: true,
      module_category_id: adminCategory.id,
    },
    {
      uuid: 'bae25e9c-876b-42c7-9260-2f1c981194c5',
      name: 'Categorías de Módulos',
      url: 'module-categories',
      is_active: true,
      module_category_id: adminCategory.id,
    },
    {
      uuid: '6e64f0e1-0e71-49cd-a837-9c43513ba5ac',
      name: 'Módulos',
      url: 'modules',
      is_active: true,
      module_category_id: adminCategory.id,
    },
    {
      uuid: 'a72169a0-8aa3-4166-83e6-5932d8a9203a',
      name: 'Roles',
      url: 'roles',
      is_active: true,
      module_category_id: adminCategory.id,
    },
    {
      uuid: '3b6448fc-d762-43a4-aaed-f24664d27786',
      name: 'Bitácora',
      url: 'logs',
      is_active: true,
      module_category_id: adminCategory.id,
    },
    {
      uuid: '9f201034-0b14-40b2-8ea8-a74b74a089df',
      name: 'Clientes',
      url: 'customers',
      is_active: true,
      module_category_id: masterDataCategory.id,
    },
  ];

  for (const module of modules) {
    await moduleRepo.upsert(module, ['uuid']);
  }

  console.log('✔ Modules sembrados');
}
