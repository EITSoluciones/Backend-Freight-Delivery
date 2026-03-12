import { DataSource } from 'typeorm';
import { Permission } from 'src/roles/entities/permission.entity';
import { Module } from 'src/modules/entities/module.entity';
import { Permissions } from 'src/auth/interfaces/permissions'; // <-- ajusta esta ruta

type PermissionSeed = {
  uuid: string;
  code: Permissions;
  name: string;
  description: string;
  is_active: boolean;
  moduleUrl: string;
};

export async function seedPermissions(dataSource: DataSource) {
  const permissionRepo = dataSource.getRepository(Permission);
  const moduleRepo = dataSource.getRepository(Module);

  const modules = await moduleRepo.find();
  const moduleMap = new Map(modules.map((m) => [m.url, m]));

  const permissions: PermissionSeed[] = [
    // Usuarios
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000002',
      code: Permissions.UsersView,
      name: 'Visualizar Usuarios',
      description: 'Permite visualizar usuarios',
      is_active: true,
      moduleUrl: '/users',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000003',
      code: Permissions.UsersCreate,
      name: 'Crear Usuarios',
      description: 'Permite crear usuarios',
      is_active: true,
      moduleUrl: '/users',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000004',
      code: Permissions.UsersUpdate,
      name: 'Actualizar Usuarios',
      description: 'Permite actualizar usuarios',
      is_active: true,
      moduleUrl: '/users',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000005',
      code: Permissions.UsersDelete,
      name: 'Eliminar Usuarios',
      description: 'Permite eliminar usuarios',
      is_active: true,
      moduleUrl: '/users',
    },

    // Categorías de módulos
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000014',
      code: Permissions.ModuleCategoriesView,
      name: 'Visualizar Categorías de Módulos',
      description: 'Permite visualizar categorías de módulos',
      is_active: true,
      moduleUrl: '/module-categories',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000015',
      code: Permissions.ModuleCategoriesCreate,
      name: 'Crear Categorías de Módulos',
      description: 'Permite crear categorías de módulos',
      is_active: true,
      moduleUrl: '/module-categories',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000016',
      code: Permissions.ModuleCategoriesUpdate,
      name: 'Actualizar Categorías de Módulos',
      description: 'Permite actualizar categorías de módulos',
      is_active: true,
      moduleUrl: '/module-categories',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000017',
      code: Permissions.ModuleCategoriesDelete,
      name: 'Eliminar Categorías de Módulos',
      description: 'Permite eliminar categorías de módulos',
      is_active: true,
      moduleUrl: '/module-categories',
    },

    // Módulos
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000018',
      code: Permissions.ModulesView,
      name: 'Visualizar Módulos',
      description: 'Permite visualizar módulos',
      is_active: true,
      moduleUrl: '/modules',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000019',
      code: Permissions.ModulesCreate,
      name: 'Crear Módulos',
      description: 'Permite crear módulos',
      is_active: true,
      moduleUrl: '/modules',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000020',
      code: Permissions.ModulesUpdate,
      name: 'Actualizar Módulos',
      description: 'Permite actualizar módulos',
      is_active: true,
      moduleUrl: '/modules',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000021',
      code: Permissions.ModulesDelete,
      name: 'Eliminar Módulos',
      description: 'Permite eliminar módulos',
      is_active: true,
      moduleUrl: '/modules',
    },

    // Roles
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000006',
      code: Permissions.RolesView,
      name: 'Visualizar Roles',
      description: 'Permite visualizar roles',
      is_active: true,
      moduleUrl: '/roles',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000007',
      code: Permissions.RolesCreate,
      name: 'Crear Roles',
      description: 'Permite crear roles',
      is_active: true,
      moduleUrl: '/roles',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000008',
      code: Permissions.RolesUpdate,
      name: 'Actualizar Roles',
      description: 'Permite actualizar roles',
      is_active: true,
      moduleUrl: '/roles',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000009',
      code: Permissions.RolesDelete,
      name: 'Eliminar Roles',
      description: 'Permite eliminar roles',
      is_active: true,
      moduleUrl: '/roles',
    },

    // Bitácora
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000030',
      code: Permissions.LogsView,
      name: 'Visualizar Bitácora',
      description: 'Permite visualizar la bitácora',
      is_active: true,
      moduleUrl: '/logs',
    },

    // Clientes
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000031',
      code: Permissions.CustomersView,
      name: 'Visualizar Clientes',
      description: 'Permite visualizar clientes',
      is_active: true,
      moduleUrl: '/customers',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000032',
      code: Permissions.CustomersCreate,
      name: 'Crear Clientes',
      description: 'Permite crear clientes',
      is_active: true,
      moduleUrl: '/customers',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000033',
      code: Permissions.CustomersUpdate,
      name: 'Actualizar Clientes',
      description: 'Permite actualizar clientes',
      is_active: true,
      moduleUrl: '/customers',
    },
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000034',
      code: Permissions.CustomersDelete,
      name: 'Eliminar Clientes',
      description: 'Permite eliminar clientes',
      is_active: true,
      moduleUrl: '/customers',
    },

    // Test
    {
      uuid: '67db0caa-9dd8-4e8d-b8b2-2f8d90000035',
      code: Permissions.Test,
      name: 'Visualizar Test',
      description: 'Permite visualizar el módulo de prueba',
      is_active: true,
      moduleUrl: '/test',
    },
  ];

  for (const item of permissions) {
    const existing = await permissionRepo.findOne({
      where: { uuid: item.uuid },
      relations: { module: true },
    });

    const module = moduleMap.get(item.moduleUrl);

    if (!module) {
      throw new Error(`No se encontró el módulo con url ${item.moduleUrl}`);
    }

    const payload: Partial<Permission> = {
      uuid: item.uuid,
      code: item.code,
      name: item.name,
      description: item.description,
      is_active: item.is_active,
      module,
    };

    if (existing) {
      permissionRepo.merge(existing, payload);
      await permissionRepo.save(existing);
    } else {
      await permissionRepo.save(permissionRepo.create(payload));
    }
  }

  console.log('✔ Permissions sembrados');
}