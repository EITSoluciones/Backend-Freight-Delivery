import { DataSource } from 'typeorm';
import { Module } from 'src/modules/entities/module.entity';
import { ModuleCategory } from 'src/module-categories/entities/module-category.entity';

type ModuleSeed = {
  uuid: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  is_active: boolean;
  categoryUuid: string;
};

export async function seedModules(dataSource: DataSource) {
  const repo = dataSource.getRepository(Module);
  const categoryRepo = dataSource.getRepository(ModuleCategory);

  const modules: ModuleSeed[] = [
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1001',
      name: 'Dashboard',
      description: 'Panel principal del sistema',
      icon: 'pi pi-home',
      url: '/dashboard',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1002',
      name: 'Usuarios',
      description: 'Administración de usuarios',
      icon: 'pi pi-users',
      url: '/users',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1003',
      name: 'Roles',
      description: 'Administración de roles',
      icon: 'pi pi-shield',
      url: '/roles',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1004',
      name: 'Permisos',
      description: 'Administración de permisos',
      icon: 'pi pi-key',
      url: '/permissions',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: 'c135ee28-e0fb-4b9e-9721-17b572a5f0ac',
      name: 'Categorías de módulos',
      description: 'Administración de categorías de módulos',
      icon: 'pi pi-folder-open',
      url: '/module-categories',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1006',
      name: 'Módulos',
      description: 'Administración de módulos',
      icon: 'pi pi-sitemap',
      url: '/modules',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1007',
      name: 'Logs',
      description: 'Bitácora del sistema',
      icon: 'pi pi-history',
      url: '/logs',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1008',
      name: 'Clientes',
      description: 'Administración de clientes',
      icon: 'pi pi-users',
      url: '/customers',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1009',
      name: 'Test',
      description: 'Módulo de pruebas',
      icon: 'pi pi-wrench',
      url: '/test',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1010',
      name: 'Plataformas',
      description: 'Administración de plataformas',
      icon: 'pi pi-mobile',
      url: '/platforms',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1011',
      name: 'Productos',
      description: 'Administración de productos',
      icon: 'pi pi-box',
      url: '/products',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1012',
      name: 'Repartidores',
      description: 'Administración de repartidores',
      icon: 'pi pi-truck',
      url: '/delivery-drivers',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1013',
      name: 'Empresas',
      description: 'Administración de empresas',
      icon: 'pi pi-building',
      url: '/companies',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1014',
      name: 'Direcciones',
      description: 'Administración de direcciones',
      icon: 'pi pi-map-marker',
      url: '/addresses',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1015',
      name: 'Configuración',
      description: 'Configuración global de la aplicación',
      icon: 'pi pi-cog',
      url: '/app-config',
      is_active: true,
      categoryUuid: 'f1dc0801-b5c1-4616-bf52-7242dd34cf1f',
    },
    {
      uuid: '5ab7ed60-cd3d-4af0-b0b1-4dcab91a1016',
      name: 'Vehículos de reparto',
      description: 'Administración de vehículos de reparto',
      icon: 'pi pi-car',
      url: '/delivery-vehicles',
      is_active: true,
      categoryUuid: '27904da2-8704-4455-9bda-9bf90714fc44',
    },
  ];

  for (const item of modules) {
    const existing = await repo.findOneBy({ uuid: item.uuid });

    const category = await categoryRepo.findOneByOrFail({
      uuid: item.categoryUuid,
    });

    const payload: Partial<Module> = {
      uuid: item.uuid,
      name: item.name,
      description: item.description,
      icon: item.icon,
      url: item.url,
      is_active: item.is_active,
      module_category_id: category.id,
    };

    if (existing) {
      repo.merge(existing, payload);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(payload));
    }
  }

  console.log('✔ Modules sembrados');
}
