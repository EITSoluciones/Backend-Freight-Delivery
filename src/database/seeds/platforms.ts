import { DataSource } from 'typeorm';
import { Platform } from 'src/platforms/entities/platform.entity';

export async function seedPlatforms(dataSource: DataSource) {
  const repo = dataSource.getRepository(Platform);

  const platforms: Partial<Platform>[] = [
    {
      code: 'web',
      name: 'web',
      is_active: true,
    },
    {
      code: 'mobile',
      name: 'mobile',
      is_active: true,
    },
  ];

  for (const item of platforms) {
    const existing = await repo.findOneBy({ code: item.code! });

    if (existing) {
      repo.merge(existing, item);
      await repo.save(existing);
    } else {
      await repo.save(repo.create(item));
    }
  }

  console.log('✔ Platforms sembradas');
}