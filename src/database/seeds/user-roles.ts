import { DataSource, In } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

type UserRoleSeed = {
  username: string;
  roleCodes: string[];
};

export async function seedUserRoles(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const seeds: UserRoleSeed[] = [
    {
      username: 'admin',
      roleCodes: ['SUPER_ADMIN'],
    }
  ];

  for (const item of seeds) {
    const user = await userRepo.findOneByOrFail({ username: item.username });
    const roles = await roleRepo.find({
      where: { code: In(item.roleCodes) },
    });

    user.roles = roles;
    await userRepo.save(user);
  }

  console.log('✔ User Roles sembrados');
}