import { DataSource } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';

export async function seedRoles(dataSource: DataSource) {
  const repo = dataSource.getRepository(Role);

  const roles: Partial<Role>[] = [
    {
      uuid: '9c6c0a80-4d2a-4d76-b8ea-111111111111',
      code: 'SUPER_ADMIN',
      name: 'Super Administrador',
      description: 'Acceso total al sistema',
      is_active: true,
    },
  ];

  for (const item of roles) {
    const existing = await repo.findOneBy({ code: item.code! });

    if (existing) {
      repo.merge(existing, item);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(item));
    }
  }

  console.log('✔ Roles sembrados');
}