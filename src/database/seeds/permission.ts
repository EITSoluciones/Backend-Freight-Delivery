import { DataSource } from 'typeorm';
import { Permission } from 'src/roles/entities/permission.entity';
import { Module } from 'src/modules/entities/module.entity';

export async function seedPermissions(dataSource: DataSource) {
  const permissionRepo = dataSource.getRepository(Permission);
  const moduleRepo = dataSource.getRepository(Module);

  // 🔑 Resolver módulos por UUID
  const usersModule = await moduleRepo.findOneByOrFail({
    uuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
  });

  const moduleCategoriesModule = await moduleRepo.findOneByOrFail({
    uuid: 'bae25e9c-876b-42c7-9260-2f1c981194c5',
  });

  const modulesModule = await moduleRepo.findOneByOrFail({
    uuid: '6e64f0e1-0e71-49cd-a837-9c43513ba5ac',
  });

  const permissions: Partial<Permission>[] = [
    // 👤 Usuarios
    {
      uuid: 'b1e00b19-36ff-4cc9-9a80-673cbbf10bf5',
      code: 'users:view',
      name: 'Visualizar Usuarios',
      description: 'Visualizar Usuarios',
      is_active: true,
      // module_id: { id: usersModule.id },
    },
    {
      uuid: '296b68ba-e0fd-412e-9520-4558b068986b',
      code: 'users:create',
      name: 'Crear Usuarios',
      description: 'Crear Usuarios',
      is_active: true,
      // module: { id: usersModule.id },
    },
    {
      uuid: '03898cdf-f595-46b9-8947-517482108af6',
      code: 'users:update',
      name: 'Actualizar Usuarios',
      description: 'Actualizar Usuarios',
      is_active: true,
      // module: { id: usersModule.id },
    },
    {
      uuid: '44c73204-5919-49a1-b0bc-e0200b6d00d7',
      code: 'users:delete',
      name: 'Eliminar Usuarios',
      description: 'Eliminar Usuarios',
      is_active: true,
      // module: { id: usersModule.id },
    },

    // 🗂 Categorías de Módulos
    {
      uuid: 'c1be8b79-66cd-47cf-94dc-4fc2616b81b8',
      code: 'modulecategories:view',
      name: 'Visualizar Categorías de Módulos',
      description: 'Visualizar Categorías',
      is_active: true,
      // module: { id: moduleCategoriesModule.id },
    },
    {
      uuid: '6b3e1f54-39b1-414a-9795-682b2d653d03',
      code: 'modulecategories:create',
      name: 'Crear Categorías de Módulos',
      description: 'Crear Categorías de Módulos',
      is_active: true,
      // module: { id: moduleCategoriesModule.id },
    },
    {
      uuid: '2e750622-1dca-4291-86b5-03439a77bce7',
      code: 'modulecategories:update',
      name: 'Actualizar Categorías de Módulos',
      description: 'Actualizar Categorías de Módulos',
      is_active: true,
      // module: { id: moduleCategoriesModule.id },
    },
    {
      uuid: '82433b95-a5c2-41f1-a375-ea03d99cd940',
      code: 'modulecategories:delete',
      name: 'Eliminar Categorías de Módulos',
      description: 'Eliminar Categorías de Módulos',
      is_active: true,
      // module: { id: moduleCategoriesModule.id },
    },

    // 📦 Módulos
    {
      uuid: '26f5b7ac-b253-427e-82af-b41df027dce4',
      code: 'modules:view',
      name: 'Visualizar Módulos',
      description: 'Visualizar Módulos',
      is_active: true,
      // module: { id: modulesModule.id },
    },
  ];

  for (const permission of permissions) {
    await permissionRepo.upsert(permission, ['uuid']);
  }

  console.log('✔ Permissions sembrados');
}
