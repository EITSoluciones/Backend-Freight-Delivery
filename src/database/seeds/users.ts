import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

type UserSeed = {
  uuid: string;
  username: string;
  email: string;
  name: string;
  last_name: string;
  password: string;
  is_active: boolean;
};

export async function seedUsers(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  const users: UserSeed[] = [
    {
      uuid: '3d8756f7-2c4b-4c29-a52d-aaaaaaaaaaaa',
      username: 'admin',
      email: 'admin@freight.local',
      name: 'Admin',
      last_name: 'Admin',
      password: 'Admin123',
      is_active: true,
    },
  ];
 
  for (const item of users) {
    const existing = await repo.findOneBy({ username: item.username });
    const hashedPassword = await bcrypt.hash(item.password, 10);

    const payload: Partial<User> = {
      uuid: item.uuid,
      username: item.username,
      email: item.email,
      name: item.name,
      last_name: item.last_name,
      password: hashedPassword,
      is_active: item.is_active,
    };

    if (existing) {
      repo.merge(existing, payload);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(payload));
    }
  }

  console.log('✔ Users sembrados');
}