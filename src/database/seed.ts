// src/database/seed.ts
import { AppDataSource } from './data-source';
import { seedModuleCategories } from './seeds';

async function runSeeds() {
  console.log('🌱 Iniciando seeds...');

  await AppDataSource.initialize();

  await seedModuleCategories(AppDataSource);

  await AppDataSource.destroy();

  console.log('✅ Seeds ejecutados correctamente');
  process.exit(0);
}

runSeeds().catch((error) => {
  console.error('❌ Error ejecutando seeds:', error);
  process.exit(1);
});
