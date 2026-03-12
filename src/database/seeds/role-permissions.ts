import { DataSource, In } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/roles/entities/permission.entity';

type RolePermissionSeed = {
  roleCode: string;
  permissionCodes: string[];
};

export async function seedRolePermissions(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);

  const allPermissions = await permissionRepo.find();
  const allPermissionCodes = allPermissions.map((p) => p.code);

  const seeds: RolePermissionSeed[] = [
    {
      roleCode: 'SUPER_ADMIN',
      permissionCodes: allPermissionCodes,
    },
  ];

  for (const item of seeds) {
    const role = await roleRepo.findOneByOrFail({ code: item.roleCode });
    const permissions = await permissionRepo.find({
      where: { code: In(item.permissionCodes) },
    });

    role.permissions = permissions;
    await roleRepo.save(role);
  }

  console.log('✔ Role Permissions sembrados');
}