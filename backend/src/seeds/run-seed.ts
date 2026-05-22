import { DataSource } from 'typeorm';
import { seedPlaces } from './seed-places';
import { seedDemoData } from './seed-demo-data';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'hiddenGem',
  entities: [
    'src/**/*.entity.ts',
  ],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false,
  logging: false,
});

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    await seedPlaces(AppDataSource);
    await seedDemoData(AppDataSource);

    await AppDataSource.destroy();
    console.log('Seeding finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
