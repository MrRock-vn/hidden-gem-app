# Database Migrations Guide

TypeORM migrations enable version control of database schema changes.

## Setup

The migration configuration is already set up in `ormconfig.json`.

## Creating Migrations

### 1. Generate Migration from Entity Changes

After modifying entities, auto-generate migration:

```bash
npm run typeorm migration:generate -- --name AddNewField
```

This creates `src/migrations/1234567890000-AddNewField.ts` with SQL changes.

### 2. Manual Migration

Create empty migration for custom SQL:

```bash
npm run typeorm migration:create -- --name CustomSQL
```

Edit the generated file:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomSQL1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration code (apply changes)
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN custom_field VARCHAR(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback code
    await queryRunner.query(`ALTER TABLE users DROP COLUMN custom_field`);
  }
}
```

## Running Migrations

### Development

```bash
# Show pending migrations
npm run typeorm migration:show

# Run pending migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert

# Revert to specific migration
npm run typeorm migration:revert -- -t 1234567890000
```

### Production

```bash
# Always run migrations before starting server
npm run typeorm migration:run

# Then start server
npm run start:prod
```

## Migration Naming

Use clear, descriptive names:

```
1234567890000-CreateUsersTable.ts       ✅
1234567890001-AddEmailToUsers.ts        ✅
1234567890002-CreatePlacesTable.ts      ✅
1234567890003-AddFollowsRelation.ts     ✅
```

## Best Practices

### ✅ Do

- One logical change per migration
- Always include both `up()` and `down()`
- Test rollback: `npm run typeorm migration:revert`
- Name migrations clearly
- Add comments for complex changes
- Use transactions for data migrations
- Keep down() migrations working

### ❌ Don't

- Mix multiple unrelated changes
- Ignore down() migrations
- Use raw SQL for simple changes (use entities instead)
- Remove old migrations
- Deploy without testing migrations

## Seed Data

Create seed file `src/seeds/seed.ts`:

```typescript
import { createConnection } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Place } from '../places/entities/place.entity';

async function seed() {
  const connection = await createConnection();

  // Create users
  const user = new User();
  user.username = 'testuser';
  user.email = 'test@example.com';
  await connection.manager.save(user);

  // Create places
  const place = new Place();
  place.title = 'Test Place';
  place.user = user;
  await connection.manager.save(place);

  console.log('Seed completed');
  await connection.close();
}

seed().catch(console.error);
```

Run seed:

```bash
npx ts-node src/seeds/seed.ts
```

## Common Tasks

### Add New Column

```bash
npm run typeorm migration:generate -- --name AddPhoneToUsers
```

Generated migration:

```typescript
export class AddPhoneToUsers1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

### Create Index

```typescript
export class CreateUserEmailIndex1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'idx_users_email');
  }
}
```

### Add Foreign Key

```typescript
export class AddPlaceUserForeignKey1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'places',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('places');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    await queryRunner.dropForeignKey('places', foreignKey);
  }
}
```

### Data Migration

```typescript
export class MigrateUsernames1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.transaction(async (transactionManager) => {
      const users = await transactionManager.query(
        'SELECT id, name FROM users',
      );

      for (const user of users) {
        const username = user.name.toLowerCase().replace(/\s+/g, '_');
        await transactionManager.update('users', user.id, { username });
      }
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic
  }
}
```

## TypeORM Configuration

File: `ormconfig.json`

```json
{
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "postgres",
  "password": "password",
  "database": "hidden_gem",
  "entities": ["src/**/*.entity.ts"],
  "migrations": ["src/migrations/*.ts"],
  "cli": {
    "migrationsDir": "src/migrations",
    "seedersDir": "src/seeds"
  },
  "synchronize": false,
  "logging": true
}
```

## Troubleshooting

### "No migrations are pending"

Migration already applied. Check `typeorm_metadata` table:

```sql
SELECT * FROM typeorm_metadata WHERE name LIKE 'migration';
```

### "Cannot find migration file"

Ensure:

- File is in `src/migrations/`
- File name matches pattern: `{timestamp}-{name}.ts`
- File has proper export: `export class MigrationName implements MigrationInterface`

### "Migration failed"

Check error and run rollback:

```bash
npm run typeorm migration:revert
# Fix issue
npm run typeorm migration:run
```

## npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-esm",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "seed:run": "ts-node src/seeds/seed.ts",
    "db:reset": "npm run migration:revert && npm run migration:run"
  }
}
```

## Initial Migration Example

Current entity structure generates this initial migration:

```typescript
export class Init1234567890000 implements MigrationInterface {
  name = 'Init1234567890000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          // ... more columns
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

## Deployment Checklist

- [ ] All migrations test locally
- [ ] Down migrations are reversible
- [ ] Data migrations have backup
- [ ] Migrations run in < 5 seconds
- [ ] Zero-downtime migrations (no table locks)
- [ ] Backward compatible (if rolling back possible)
- [ ] Tested on staging environment
- [ ] Rollback plan in place

## Advanced: Zero-Downtime Migrations

For large tables, use safe patterns:

```typescript
// ✅ Safe: Add nullable column
await queryRunner.addColumn(
  'users',
  new TableColumn({
    name: 'new_field',
    type: 'varchar',
    isNullable: true,
  }),
);

// ❌ Risky: Add NOT NULL column without default
await queryRunner.addColumn(
  'users',
  new TableColumn({
    name: 'required_field',
    type: 'varchar',
    isNullable: false,
  }),
);

// ✅ Safe: Add with default
await queryRunner.addColumn(
  'users',
  new TableColumn({
    name: 'required_field',
    type: 'varchar',
    isNullable: false,
    default: "'default_value'",
  }),
);
```

## References

- [TypeORM Migrations Docs](https://typeorm.io/migrations)
- [TypeORM Query Runner](https://typeorm.io/query-runner-api)
- [Database Schema Design](https://www.postgresql.org/docs/)
