import { DataSource, In } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/users/entities/user-role.entity';

type UserRoleSeed = {
  username: string;
  roleCodes: string[];
};

export async function seedUserRoles(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const userRoleRepo = dataSource.getRepository(UserRole);

  const seeds: UserRoleSeed[] = [
    {
      username: 'admin',
      roleCodes: ['SUPER_ADMIN'],
    },
  ];

  for (const item of seeds) {
    const user = await userRepo.findOneByOrFail({ username: item.username });
    const roles = await roleRepo.find({
      where: { code: In(item.roleCodes) },
    });
    await userRoleRepo.delete({ user_id: user.id });
    await userRoleRepo.save(
      roles.map((role) =>
        userRoleRepo.create({
          user_id: user.id,
          role_id: role.id,
        }),
      ),
    );
  }

  console.log('✔ User Roles sembrados');
}
