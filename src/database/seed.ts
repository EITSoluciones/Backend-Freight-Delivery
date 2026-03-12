// src/database/seed.ts
import { AppDataSource } from './data-source';
import { seedModuleCategories, seedModules, seedPermissions, seedPlatforms, seedRolePermissions, seedRoles, seedUserPlatforms, seedUserRoles, seedUsers } from './seeds';

async function refreshDatabase() {
  await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  const tables = [
    'user_roles',
    'user_platforms',
    'role_permissions',
    'users',
    'roles',
    'permissions',
    'modules',
    'module_categories',
    'platforms',
  ];

  for (const table of tables) {
    await AppDataSource.query(`TRUNCATE TABLE \`${table}\`;`);
  }

  await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
}


async function runSeeds() {
  console.log('🌱 Iniciando seeds...');
  await AppDataSource.initialize();
  const refresh = process.argv.includes('--refresh');
  if (refresh) {
    console.log('🧹 Limpiando tablas...');
    await refreshDatabase();
  }

  await seedModuleCategories(AppDataSource);
  await seedPlatforms(AppDataSource);
  await seedModules(AppDataSource);
  await seedPermissions(AppDataSource);
  await seedRoles(AppDataSource);
  await seedUsers(AppDataSource);
  await seedRolePermissions(AppDataSource);
  await seedUserPlatforms(AppDataSource);
  await seedUserRoles(AppDataSource);


  console.log('✅ Seeds ejecutados correctamente');
  process.exit(0);
}

runSeeds().catch((error) => {
  console.error('❌ Error ejecutando seeds:', error);
  process.exit(1);
});
