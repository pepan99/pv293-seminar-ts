# Third seminar - Integration of Postgres/Kysely with our NestJS app

In this third seminar, we will be integrating Postgres and Kysely into our NestJS application to replace in-memory storage with a real database.

## Seminar assignments

### 1. Install dependencies and setup environment

```bash
pnpm install

# Install Kysely and related packages
pnpm add kysely pg
pnpm add -D kysely-codegen @types/pg

# Create environment file for database configuration
cp .env.example .env
```

### 2. Setup Postgres with Docker

Create a `docker-compose.yml` file in the `apps/finance-manager` directory to run Postgres:
- Use the official `postgres:17-alpine` image
- Configure environment variables for database name, user, and password
- Expose port 5432
- Add a volume for data persistence

You'll also need to create:
- `.env` file with database connection details
- `docker.env` file for Docker container environment variables

Start the Postgres database:
```bash
docker-compose up -d
```

### 3. Create the Database Module

Create a new `database` module under `src/modules/database/`:

**`database-options.ts`** - Define the database configuration interface:
```typescript
export type DatabaseOptions = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
```

**`database.module-definition.ts`** - Create a configurable module using NestJS's `ConfigurableModuleBuilder`:
```typescript
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DatabaseOptions } from './database-options';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: DATABASE_OPTIONS } =
  new ConfigurableModuleBuilder<DatabaseOptions>().build();
```

**`database.ts`** - Export the Database type:
```typescript
import { Kysely } from 'kysely';
import { DB } from '../common/types/db';

export class Database extends Kysely<DB> {}
```

**`database.module.ts`** - Configure Kysely with Postgres:
```typescript
import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { ConfigurableModuleClass, DATABASE_OPTIONS } from './database.module-definition';
import { DatabaseOptions } from './database-options';
import { Database } from './database';

@Global()
@Module({
  exports: [Database],
  providers: [
    {
      provide: Database,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        const dialect = new PostgresDialect({
          pool: new Pool({
            host: databaseOptions.host,
            port: databaseOptions.port,
            user: databaseOptions.user,
            password: databaseOptions.password,
            database: databaseOptions.database,
          }),
        });

        return new Kysely<Database>({
          dialect,
          plugins: [new CamelCasePlugin()],
        });
      },
    },
  ],
})
export class DatabaseModule extends ConfigurableModuleClass {}
```

The Database module should:
- Use the `pg` Pool for connection management
- Configure Kysely with PostgresDialect and CamelCasePlugin
- Be marked as `@Global()` for app-wide availability
- Export the Database instance

### 4. Create migrations

Create migration files in `src/migrations/`:
- `20250321101523_create_users_table.ts` - Create users table
- `20250321101612_create_account_type_enum.ts` - Create account type enum
- `20250321101704_create_accounts_table.ts` - Create accounts table with foreign key to users
- `20250322185234_insert_admin.ts` - Insert a default admin user

Each migration should export `up` and `down` functions using Kysely's schema builder.

Implement a migration runner in `src/run-migrations.ts` that uses Kysely's `Migrator` to run these migrations. (Kysely has it in docs)

```json
"scripts:"{
  "migrations": "ts-node ./src/run-migrations.ts",
}
```

### 5. Generate database type definitions

After creating and running your migrations, use `kysely-codegen` to automatically generate TypeScript types from your database schema.

Add a script to `package.json`:
```json
"scripts": {
  "kysely-codegen": "kysely-codegen --camel-case --out-file ./src/common/types/db.d.ts "
}
```

Run the migrations first, then generate types:
```bash
# Run migrations
pnpm run migrations

# Generate types from database schema
pnpm run kysely-codegen
```

This will generate `src/common/types/db.d.ts` with:
- Type-safe table definitions for `users` and `accounts`
- The `AccountType` enum
- The `DB` interface that represents your entire database schema

The generated types provide full type safety for all Kysely queries.

### 6. Implement Repository Pattern for Users

Create `src/modules/users/repositories/users.repository.ts` from the example.repository.ts.

Update `UsersService` to use the new repository.

### 7. Implement Repository Pattern for Accounts

Create `src/modules/accounts/repositories/accounts.repository.ts`:
- Replace the Map-based storage with database queries
- Implement all account operations (create, findAll, findOne, update, remove)
- Add user-based filtering to ensure data isolation

Update `AccountsService` to use the repository instead of the in-memory Map.

### 8. Configure the Database Module in AppModule

Register the DatabaseModule in `AppModule` using the configuration pattern:
```typescript
DatabaseModule.forRootAsync({
  inject: [EnvService],
  useFactory: (envService: EnvService) => ({
    host: envService.get('POSTGRES_HOST'),
    port: envService.get('POSTGRES_PORT'),
    // ... other config
  }),
})
```

### 9. Test your implementation

Run the k6 tests to verify everything works:
```bash
pnpm run test:k6
```

All tests should pass if the database integration is correct.


### Assignment Requirements

#### Account Management
- Create a system to track multiple financial accounts (bank, investments, cash, assets, liability)
- Implement balance tracking and reconciliation features
- Support manual account entry for cash and offline instruments
- Persist all account data in Postgres

#### Database Design
- Design proper table schemas for users and accounts
- Implement foreign key relationships
- Add appropriate constraints and indexes
- Use migrations for schema management

#### Data Access Layer
- Implement repositories using Kysely
- Ensure type safety across all database operations
- Handle errors appropriately (e.g., not found, unique constraints)
- Isolate user data (users can only access their own accounts)
