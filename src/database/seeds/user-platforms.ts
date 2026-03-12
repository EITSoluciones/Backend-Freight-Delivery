import { DataSource, In } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Platform } from 'src/platforms/entities/platform.entity';

type UserPlatformSeed = {
  username: string;
  platformCodes: string[];
};

export async function seedUserPlatforms(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const platformRepo = dataSource.getRepository(Platform);

  const seeds: UserPlatformSeed[] = [
    {
      username: 'admin',
      platformCodes: ['web', 'mobile'],
    },
    
  ];

  for (const item of seeds) {
    const user = await userRepo.findOneByOrFail({ username: item.username });
    const platforms = await platformRepo.find({
      where: { code: In(item.platformCodes) },
    });

    user.platforms = platforms;
    await userRepo.save(user);
  }

  console.log('✔ User Platforms sembrados');
}