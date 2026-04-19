import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostGIS1000000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Don't drop extensions on rollback for safety
  }
}
