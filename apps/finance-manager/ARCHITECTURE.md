# Finance Manager - Architecture Documentation

A comprehensive guide to the finance-manager application structure, architecture, and design patterns.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Module Structure](#module-structure)
- [Key Architectural Patterns](#key-architectural-patterns)
- [How It Works](#how-it-works)
- [Database Strategy](#database-strategy)
- [Configuration Management](#configuration-management)
- [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Current State](#current-state)

## Overview

The finance-manager is a **NestJS-based modular monolith** following Domain-Driven Design (DDD) and CQRS patterns. It's designed as a REST API with clear bounded contexts, architected to eventually transition to microservices.

### Key Characteristics

- **Modular Monolith**: Single deployable with independent modules
- **Event-Driven**: Modules communicate via events (EventBus → RabbitMQ)
- **Database-per-Module**: Each module owns its database
- **Type-Safe**: TypeScript + Kysely + Zod throughout
- **CQRS**: Separate command and query models
- **DDD**: Aggregates, repositories, domain events

## Architecture

### High-Level Structure

```
finance-manager/
└── src/
    ├── main.ts              Application entry point
    ├── app.module.ts        Root module
    └── modules/
        ├── shared-kernel/   Cross-cutting infrastructure & utilities
        ├── auth/            Authentication & JWT token management
        ├── users/           User management & administration
        ├── accounts/        Financial accounts management
        └── health/          Health checks & monitoring
```

### Bounded Contexts (DDD)

Each module represents a separate **bounded context**:

| Module | Database | Purpose |
|--------|----------|---------|
| **Auth** | auth_db | JWT authentication, token management |
| **Users** | users_db | User profiles, roles, administration |
| **Accounts** | accounts_db | Financial accounts, balances |

**Isolation Principles**:
- ✅ Own database per module
- ✅ Own configuration (.env file)
- ✅ Own types and entities
- ❌ No direct cross-module database access
- ❌ No shared domain models

## Technology Stack

### Core Framework
- **NestJS** v11.0.1 - Progressive Node.js framework
- **TypeScript** v5.7.3 - Type-safe language
- **Express** - HTTP server (via NestJS platform-express)

### Database Layer
- **PostgreSQL** 17 - Relational database
- **Kysely** v0.27.6 - Type-safe SQL query builder
- **pg** v8.14.1 - PostgreSQL client
- **kysely-ctl** - Migration management

**Why Kysely over ORM?**
- 100% type-safe SQL queries
- Auto-completion and type inference
- No runtime overhead
- Full SQL control
- Generated types from database schema

### CQRS & Events
- **@nestjs/cqrs** v11.0.3 - Command/Query handlers and EventBus
- **RxJS** v7.8.1 - Reactive programming for event streams
- **RabbitMQ** (in progress) - Message broker for inter-module communication

### Authentication & Security
- **@nestjs/jwt** v11.0.0 - JWT token generation/validation
- **@nestjs/passport** v11.0.5 - Authentication strategies
- **passport-jwt** v4.0.1 - JWT authentication strategy
- **bcryptjs** v3.0.2 - Password hashing

### Validation & Documentation
- **Zod** v3.24.2 - Schema validation
- **nestjs-zod** v4.3.1 - Zod integration for NestJS
- **@nestjs/swagger** v11.0.6 - OpenAPI documentation

### Development Tools
- **Webpack** v5.98.0 with HMR (Hot Module Replacement)
- **Jest** v29.7.0 - Testing framework
- **k6** - Load testing
- **ESLint** & **Prettier** - Code quality

## Project Structure

### Standard Module Layout

Each module follows a consistent **hexagonal/clean architecture** pattern:

```
module-name/
├── api/                           (Presentation Layer)
│   ├── controllers/              REST endpoints
│   │   └── module.controller.ts
│   └── dtos/                     Data Transfer Objects with Zod schemas
│       ├── create-entity.dto.ts
│       ├── update-entity.dto.ts
│       └── entity-response.dto.ts
│
├── application/                   (Application Layer)
│   ├── commands/                 Command handlers (write operations)
│   │   ├── create-entity.command.ts
│   │   ├── create-entity.handler.ts
│   │   └── ...
│   ├── queries/                  Query handlers (read operations)
│   │   ├── get-entity.query.ts
│   │   ├── get-entity.handler.ts
│   │   └── ...
│   └── events/                   Event handlers for cross-module events
│       ├── entity-created.handler.ts
│       └── ...
│
├── core/                         (Domain Layer)
│   ├── aggregates/              Domain aggregates with business logic
│   │   └── entity.aggregate.ts
│   ├── entities/                Entity types from Kysely
│   │   └── index.ts
│   ├── events/                  Domain events
│   │   ├── entity-created.event.ts
│   │   └── ...
│   ├── repositories/            Repository interfaces
│   │   ├── entity.repository.interface.ts
│   │   └── entity-aggregate.repository.interface.ts
│   └── types/                   Domain types and DB types
│       └── db.d.ts              (Generated by kysely-codegen)
│
├── infrastructure/               (Infrastructure Layer)
│   ├── config/                  Module-specific configuration
│   │   └── module.config.service.ts
│   ├── database/
│   │   ├── repositories/        Repository implementations
│   │   │   ├── entity.repository.ts
│   │   │   └── entity-aggregate.repository.ts
│   │   └── migrations/          Database migrations
│   │       └── YYYYMMDDHHMMSS_migration_name.ts
│   └── anti-corruption-layer/   Event mappers for cross-module communication
│       ├── event-name.mapper.ts
│       └── mapped-event.ts
│
├── .env                         Module environment configuration
├── .env.example                 Environment template
├── module-name.config.ts        Configuration loader
└── module-name.module.ts        NestJS module definition
```

### Layer Responsibilities

**API Layer (Presentation)**:
- HTTP request/response handling
- DTO validation with Zod schemas
- Route guards (authentication, authorization)
- Swagger documentation decorators

**Application Layer**:
- Command handlers: Execute business operations
- Query handlers: Fetch and transform data
- Event handlers: React to cross-module events
- Use cases orchestration

**Core Layer (Domain)**:
- Aggregates: Business logic and invariants
- Domain events: What happened in the domain
- Repository interfaces: Data access contracts
- Domain types: Business concepts

**Infrastructure Layer**:
- Repository implementations: Data persistence
- Database migrations: Schema changes
- Configuration: Environment-specific settings
- Anti-Corruption Layer: Event translation between contexts

## Module Structure

### Shared-Kernel Module

**Purpose**: Cross-cutting concerns and shared infrastructure

**Location**: `src/modules/shared-kernel/`

**Components**:

**API Layer**:
- `JwtAuthGuard`: Validates JWT tokens on protected routes
- `RolesGuard`: Checks user roles for authorization
- `@User()` decorator: Extracts authenticated user from request
- `@Roles()` decorator: Specifies required roles for endpoints

**Infrastructure**:
- `DatabaseModule`: Dynamic database connection per module
  ```typescript
  DatabaseModule.forFeatureAsync({
    imports: [ModuleConfigModule],
    useFactory: (config) => ({
      host: config.postgresHost,
      database: config.postgresDB,
    }),
  })
  ```
- `EnvModule`: Environment configuration with Zod validation
- `RabbitMQPublisher`: Publishes events to RabbitMQ (in progress)
- `RabbitMQSubscriber`: Subscribes to RabbitMQ queues (in progress)

**Core Types**:
- `RequestUser`: Authenticated user interface
- `UserRole`: Enum (admin, user)
- `CommandSucceededWithId`: Standard command response

### Auth Module

**Purpose**: Authentication and authorization

**Location**: `src/modules/auth/`

**Database**: auth_db

**Key Features**:
- User registration with JWT token generation
- Login with JWT authentication
- Token refresh mechanism
- Token validation
- JWT strategy using Passport

**API Endpoints**:

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Authenticate user | Public |
| POST | `/auth/refresh` | Refresh JWT token | Public |
| POST | `/auth/validate` | Validate JWT token | Public |

**Commands**:
- `LoginCommand` - Authenticate user, return JWT
- `RegisterCommand` - Create new user account
- `RefreshTokenCommand` - Refresh JWT token
- `ValidateTokenCommand` - Validate JWT token

**Queries**: None (stateless JWT validation)

**Events Emitted**:
- `UserRegisteredEvent` - When new user registers

**Events Consumed**:
- `UserUpdatedEvent` (from Users) → `UserUpdatedMappedEvent`

**Anti-Corruption Layer**:
```typescript
// Listens to UserUpdatedEvent from Users module
UserUpdatedEvent → UserUpdatedMapper → UserUpdatedMappedEvent
// Updates local user copy in auth_db
```

### Users Module

**Purpose**: User management and administration

**Location**: `src/modules/users/`

**Database**: users_db

**Key Features**:
- User CRUD operations
- Password management
- Role management (admin, user)
- Admin protection (cannot remove last admin)

**API Endpoints**:

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | User (own) / Admin |
| POST | `/users` | Create new user | Admin |
| PATCH | `/users/:id` | Update user | User (own) / Admin |
| DELETE | `/users/:id` | Remove user | Admin |
| PATCH | `/users/:id/password` | Change password | User (own) / Admin |

**Commands**:
- `CreateUserCommand` - Create new user
- `UpdateUserCommand` - Update user profile
- `UpdateUserAdminCommand` - Admin update (roles, status)
- `RemoveUserCommand` - Delete user (with last admin check)
- `ChangePasswordCommand` - Update password

**Queries**:
- `GetAllUsersQuery` - Fetch all users
- `GetUserByIdQuery` - Fetch single user
- `GetUserByEmailQuery` - Find user by email

**Events Emitted**:
- `UserCreatedEvent`
- `UserUpdatedEvent`
- `UserRemovedEvent`
- `UserPasswordChangedEvent`

**Events Consumed**:
- `UserRegisteredEvent` (from Auth) → `UserRegisteredMappedEvent`

**Anti-Corruption Layer**:
```typescript
// Listens to UserRegisteredEvent from Auth module
UserRegisteredEvent → UserRegisteredMapper → UserRegisteredMappedEvent
// Creates user in users_db when registered
```

**Aggregate**: `UserAggregate`
```typescript
UserAggregate.create(data)
UserAggregate.update(data)
UserAggregate.changePassword(newPassword)
UserAggregate.updateRoles(roles)
```

### Accounts Module

**Purpose**: Financial account management

**Location**: `src/modules/accounts/`

**Database**: accounts_db

**Key Features**:
- Create financial accounts (checking, savings, credit, investment)
- Track account balances
- Account reconciliation
- Multi-currency support
- Account customization (icon, color)

**API Endpoints**:

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/accounts` | Get all user accounts | User |
| GET | `/accounts/:id` | Get account by ID | User (own) |
| POST | `/accounts` | Create new account | User |
| PATCH | `/accounts/:id` | Update account | User (own) |
| DELETE | `/accounts/:id` | Remove account | User (own) |
| POST | `/accounts/:id/reconcile` | Reconcile balance | User (own) |

**Account Types**:
- `checking` - Checking account
- `savings` - Savings account
- `credit` - Credit card
- `investment` - Investment account

**Commands**:
- `CreateAccountCommand` - Create new account
- `UpdateAccountCommand` - Update account details
- `RemoveAccountCommand` - Delete account
- `ReconcileAccountCommand` - Update actual balance

**Queries**:
- `GetAccountByIdQuery` - Fetch single account
- `GetAllAccountsQuery` - Fetch all user accounts
- `GetAccountBalanceQuery` - Get account balance
- `GetTotalBalanceQuery` - Get total balance across all accounts

**Events Emitted**:
- `AccountCreatedEvent`
- `AccountUpdatedEvent`
- `AccountRemovedEvent`
- `AccountReconciledEvent`

**Aggregate**: `AccountAggregate`
```typescript
AccountAggregate.create(data)
AccountAggregate.update(data)
AccountAggregate.reconcile(actualBalance)
AccountAggregate.remove()
```

### Health Module

**Purpose**: Health checks and monitoring

**Location**: `src/modules/health/`

**Endpoints**:
- `GET /health` - Application health status

## Key Architectural Patterns

### 1. CQRS (Command Query Responsibility Segregation)

**Separation of Reads and Writes**:

```typescript
// Commands (Write operations)
CreateAccountCommand → CreateAccountCommandHandler → Repository.save()

// Queries (Read operations)
GetAccountByIdQuery → GetAccountByIdQueryHandler → Repository.findById()
```

**Benefits**:
- Clear separation of concerns
- Independent scaling of reads/writes
- Easier testing (focused handlers)
- Optimized data models for each operation

**Implementation Example**:
```typescript
// Command
@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler {
  async execute(command: CreateAccountCommand) {
    const aggregate = AccountAggregate.create(command.data);
    return await this.repository.createAccount(aggregate);
  }
}

// Query
@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler {
  async execute(query: GetAccountByIdQuery) {
    return await this.repository.findById(query.id);
  }
}
```

### 2. Domain-Driven Design

**Aggregates** (Domain roots with business logic):

```typescript
// AccountAggregate
class AccountAggregate extends AggregateRoot {
  static create(data: CreateAccountData): AccountAggregate {
    const aggregate = new AccountAggregate();
    aggregate.apply(new AccountCreatedEvent(data));
    return aggregate;
  }

  update(data: UpdateAccountData): void {
    // Apply business rules
    this.apply(new AccountUpdatedEvent(data));
  }

  reconcile(actualBalance: number): void {
    // Validate balance
    this.apply(new AccountReconciledEvent(actualBalance));
  }
}
```

**Domain Events**:
```typescript
export class AccountCreatedEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly accountType: AccountType,
  ) {}
}
```

**Repository Pattern**:
```typescript
// Interface (Domain Layer)
export interface IAccountsAggregateRepository {
  createAccount(aggregate: AccountAggregate): Promise<string>;
  updateAccount(aggregate: AccountAggregate): Promise<void>;
  removeAccount(aggregate: AccountAggregate): Promise<void>;
}

// Implementation (Infrastructure Layer)
@Injectable()
export class AccountAggregateRepository
  implements IAccountsAggregateRepository {

  async createAccount(aggregate: AccountAggregate): Promise<string> {
    // Merge aggregate with CQRS EventPublisher
    this.publisher.mergeObjectContext(aggregate);

    // Persist to database
    const id = await this.db
      .insertInto('accounts')
      .values(aggregate.getState())
      .returning('id')
      .executeTakeFirstOrThrow();

    // Publish domain events
    aggregate.commit();

    return id;
  }
}
```

### 3. Event-Driven Architecture

**Intra-Module Events** (within same module):
```typescript
// Emit event
this.eventBus.publish(new AccountCreatedEvent(data));

// Handle event
@EventsHandler(AccountCreatedEvent)
export class AccountCreatedHandler {
  handle(event: AccountCreatedEvent) {
    // React to event
  }
}
```

**Inter-Module Events** (cross-module communication):
```
Auth Module                           Users Module
     ↓                                     ↑
UserRegisteredEvent ──→ EventBus ──→ Mapper ──→ UserRegisteredMappedEvent
                                                  ↓
                                          Create user in users_db
```

### 4. Anti-Corruption Layer (ACL)

**Purpose**: Translate events between bounded contexts

**Pattern**:
```typescript
// Step 1: Listen to external event
@EventsHandler(UserUpdatedEvent) // From Auth module
export class UserUpdatedEventHandler {
  handle(event: UserUpdatedEvent) {
    // Map to internal event
    const mappedEvent = UserUpdatedMapper.map(event);
    this.eventBus.publish(mappedEvent);
  }
}

// Step 2: Mapper translates the event
export class UserUpdatedMapper {
  static map(event: UserUpdatedEvent): UserUpdatedMappedEvent {
    return new UserUpdatedMappedEvent(
      event.userId,
      event.email,
      // Transform to internal model
    );
  }
}

// Step 3: Handle internal event
@EventsHandler(UserUpdatedMappedEvent)
export class UserUpdatedMappedHandler {
  async handle(event: UserUpdatedMappedEvent) {
    // Update in local database
    await this.repository.updateUser(event.userId, event.data);
  }
}
```

**Benefits**:
- Prevents domain model contamination
- Allows independent evolution of modules
- Clear translation boundaries
- Easier testing

### 5. Repository Pattern

**Two-Level Repository Structure**:

1. **Basic Repository** (Simple CRUD):
```typescript
interface IAccountsRepository {
  findById(id: string): Promise<Account | undefined>;
  findAll(userId: string): Promise<Account[]>;
  create(account: Account): Promise<string>;
  update(id: string, data: Partial<Account>): Promise<void>;
  delete(id: string): Promise<void>;
}
```

2. **Aggregate Repository** (With event publishing):
```typescript
interface IAccountsAggregateRepository {
  createAccount(aggregate: AccountAggregate): Promise<string>;
  updateAccount(aggregate: AccountAggregate): Promise<void>;
  removeAccount(aggregate: AccountAggregate): Promise<void>;
}
```

**Usage**:
- Commands use **Aggregate Repositories** (emit events)
- Queries use **Basic Repositories** (read-only, no events)

## How It Works

### Request Flow: Creating an Account

```
1. HTTP Request
   POST /accounts
   Body: { name: "My Savings", accountType: "savings", currency: "USD" }
   Headers: { Authorization: "Bearer <jwt>" }
   ↓

2. Guards & Decorators
   JwtAuthGuard → validates token
   @User() decorator → extracts user
   ↓

3. Controller
   AccountsController.create(@User() user, @Body() dto)
   Validates DTO with Zod schema
   ↓

4. Command Execution
   this.commandBus.execute(
     new CreateAccountCommand(user.id, dto)
   )
   ↓

5. Command Handler
   CreateAccountCommandHandler.execute()
   ↓

6. Aggregate Creation
   const aggregate = AccountAggregate.create(data)
   aggregate.apply(new AccountCreatedEvent(...))
   ↓

7. Repository Persistence
   repository.createAccount(aggregate)
   - Merge with EventPublisher
   - INSERT INTO accounts_db.accounts
   - aggregate.commit() publishes events
   ↓

8. Event Publishing
   EventBus broadcasts AccountCreatedEvent
   (Other modules can listen if needed)
   ↓

9. HTTP Response
   200 OK
   { id: "uuid-here" }
```

### Cross-Module Communication: User Registration

```
┌─────────────────────────────────────────────────────────────┐
│ 1. AUTH MODULE                                              │
│                                                             │
│ POST /auth/register                                         │
│   ↓                                                         │
│ RegisterCommandHandler                                      │
│   ↓                                                         │
│ Create user in auth_db                                      │
│   ↓                                                         │
│ Publish: UserRegisteredEvent                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (EventBus)
┌─────────────────────────────────────────────────────────────┐
│ 2. USERS MODULE - Anti-Corruption Layer                     │
│                                                             │
│ @EventsHandler(UserRegisteredEvent)                         │
│ UserRegisteredEventHandler.handle()                         │
│   ↓                                                         │
│ UserRegisteredMapper.map()                                  │
│   - Translate to internal model                             │
│   - Create: UserRegisteredMappedEvent                       │
│   ↓                                                         │
│ Publish: UserRegisteredMappedEvent                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (EventBus)
┌─────────────────────────────────────────────────────────────┐
│ 3. USERS MODULE - Application Layer                         │
│                                                             │
│ @EventsHandler(UserRegisteredMappedEvent)                   │
│ UserRegisteredMappedHandler.handle()                        │
│   ↓                                                         │
│ UserAggregate.create()                                      │
│   ↓                                                         │
│ Create user in users_db                                     │
│   ↓                                                         │
│ Result: User exists in both auth_db and users_db            │
└─────────────────────────────────────────────────────────────┘
```

**Why This Pattern?**
- ✅ Eventual consistency between modules
- ✅ No direct database coupling
- ✅ Each module owns its data
- ✅ Modules can evolve independently
- ✅ Ready for microservices migration

## Database Strategy

### Database-per-Module Architecture

**Three Separate Databases**:

| Database | Owner | Tables |
|----------|-------|--------|
| **auth_db** | Auth Module | users (for authentication) |
| **users_db** | Users Module | users, users_roles |
| **accounts_db** | Accounts Module | accounts |

**Initialization**: `init-multiple-dbs.sh`
```bash
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE users_db;
    CREATE DATABASE accounts_db;
EOSQL
```

**Connection per Module**:
```typescript
// Auth module connects to auth_db
DatabaseModule.forFeatureAsync({
  imports: [AuthConfigModule],
  useFactory: (config: AuthConfigService) => ({
    host: config.postgresHost,
    database: 'auth_db', // From .env: POSTGRES_DB=auth_db
  }),
})

// Users module connects to users_db
DatabaseModule.forFeatureAsync({
  imports: [UsersConfigModule],
  useFactory: (config: UsersConfigService) => ({
    host: config.postgresHost,
    database: 'users_db', // From .env: POSTGRES_DB=users_db
  }),
})
```

**Benefits**:
- **Isolation**: Module failures don't cascade
- **Scalability**: Independent database scaling
- **Microservices-Ready**: Clean separation for extraction
- **Security**: Granular access control
- **Performance**: Optimized schemas per context

### Query Builder: Kysely

**Type Generation**:
```bash
# Generate TypeScript types from database schema
pnpm kysely-codegen --out-file=src/modules/accounts/core/types/db.d.ts
```

**Generated Types** (example):
```typescript
// Auto-generated from schema
export interface Database {
  accounts: AccountsTable;
}

export interface AccountsTable {
  id: Generated<string>;
  name: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  currency: string;
  initialBalance: number;
  currentBalance: number;
  userId: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}
```

**Type-Safe Queries**:
```typescript
// Full type safety and auto-completion
const account = await this.db
  .selectFrom('accounts')
  .where('id', '=', accountId)
  .where('userId', '=', userId)
  .selectAll()
  .executeTakeFirst();
// Type: AccountsTable | undefined
```

### Database Migrations

**Location**: `src/modules/{module}/infrastructure/database/migrations/`

**Example Migration**:
```typescript
// 20250321101704_create_accounts_table.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('accounts')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('accountType', 'varchar(50)', (col) => col.notNull())
    .addColumn('currency', 'varchar(3)', (col) => col.notNull())
    .addColumn('initialBalance', 'numeric(15, 2)', (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn('currentBalance', 'numeric(15, 2)', (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn('userId', 'uuid', (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updatedAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await db.schema
    .createIndex('accounts_userId_idx')
    .on('accounts')
    .column('userId')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('accounts').execute();
}
```

**Running Migrations**:
```bash
# Run all pending migrations
pnpm run migrate:latest

# Rollback last migration
pnpm run migrate:down

# Create new migration
pnpm run migrate:make migration_name
```

## Configuration Management

### Module-Specific Configuration

Each module has its own configuration:

```
src/modules/auth/
  ├── .env                    # Module environment variables
  ├── .env.example            # Template
  ├── auth.config.ts          # Config registration
  └── infrastructure/config/
      └── auth-config.service.ts  # Config service with validation
```

### Configuration Flow

**1. Environment File** (`.env`):
```env
# src/modules/auth/.env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=auth_db

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**2. Config Registration** (`auth.config.ts`):
```typescript
import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load module-specific .env
config({ path: resolve(__dirname, '.env') });

export default registerAs('auth', () => ({
  postgresHost: process.env.POSTGRES_HOST,
  postgresPort: parseInt(process.env.POSTGRES_PORT || '5432'),
  postgresDB: process.env.POSTGRES_DB,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
}));
```

**3. Config Service** (`auth-config.service.ts`):
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidatedConfigService } from '../env-config';
import { z } from 'zod';

const authConfigSchema = z.object({
  postgresHost: z.string(),
  postgresPort: z.number(),
  postgresDB: z.string(),
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string(),
});

@Injectable()
export class AuthConfigService extends ValidatedConfigService {
  constructor(configService: ConfigService) {
    super(configService, 'auth', authConfigSchema);
  }

  get postgresHost(): string {
    return this.get('postgresHost');
  }

  get jwtSecret(): string {
    return this.get('jwtSecret');
  }
}
```

**4. Config Module** (`auth-config.module.ts`):
```typescript
@Module({
  imports: [
    EnvModule.forRoot(),
    ConfigModule.forFeature(authConfig),
  ],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class AuthConfigModule {}
```

**Benefits**:
- ✅ Type-safe configuration
- ✅ Validation with Zod schemas
- ✅ Module isolation
- ✅ Easy testing (mock config service)
- ✅ Auto-completion in IDE

## Docker Setup

### Docker Compose Services

**File**: `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: nestjs-kysely-postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-multiple-dbs.sh:/docker-entrypoint-initdb.d/init-multiple-dbs.sh
    env_file:
      - docker.env
    networks:
      - postgres

  pgadmin:
    image: dpage/pgadmin4
    container_name: nestjs-kysely-pgadmin
    ports:
      - "8080:80"
    env_file:
      - docker.env
    networks:
      - postgres

  rabbitmq:
    image: rabbitmq:3-management
    container_name: finance-manager-rabbitmq
    ports:
      - "5672:5672"   # AMQP
      - "15672:15672" # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    env_file:
      - docker.env
    networks:
      - app-network

volumes:
  postgres_data:
  rabbitmq_data:

networks:
  postgres:
    driver: bridge
  app-network:
    driver: bridge
```

### Environment File

**File**: `docker.env`

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

# RabbitMQ
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
```

### Starting Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f postgres
docker-compose logs -f rabbitmq

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Database Initialization

The `init-multiple-dbs.sh` script runs on first startup:

```bash
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE users_db;
    CREATE DATABASE accounts_db;
EOSQL
```

## API Documentation

### Swagger/OpenAPI

**Access**: http://localhost:3000/swagger

**Configuration** (`main.ts`):
```typescript
const config = new DocumentBuilder()
  .setTitle('Finance Manager API')
  .setDescription('Personal finance management API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('swagger', app, document);
```

### Authentication

**JWT Bearer Token**:
1. Register or login to obtain token
2. Add to Authorization header: `Bearer <token>`
3. Token contains user ID and roles

**Decorators**:
```typescript
// Require authentication
@UseGuards(JwtAuthGuard)
@Get()
getAccounts(@User() user: RequestUser) {
  // user is automatically injected
}

// Require specific role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('users')
getAllUsers() {
  // Only admins can access
}
```

### Example API Calls

**Register**:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Create Account**:
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Checking",
    "accountType": "checking",
    "currency": "USD",
    "initialBalance": 1000,
    "icon": "💰",
    "color": "#4CAF50"
  }'
```

## Current State

### Completed Features ✅

- **Authentication System**
  - JWT token generation and validation
  - Token refresh mechanism
  - Passport JWT strategy

- **User Management**
  - CRUD operations
  - Role-based access control
  - Password management
  - Admin protection

- **Financial Accounts**
  - Account creation and management
  - Multiple account types
  - Balance tracking
  - Multi-currency support

- **Architecture**
  - CQRS implementation
  - Domain-Driven Design
  - Event-driven communication (in-memory)
  - Multi-database setup
  - Anti-corruption layers

- **Infrastructure**
  - Docker Compose setup
  - Database migrations
  - Type-safe configuration
  - API documentation (Swagger)

### In Progress 🔄 (Seminar 10)

- **RabbitMQ Integration**
  - Message queue setup
  - Event publishing to RabbitMQ
  - Event subscription from RabbitMQ
  - Replacing in-memory EventBus with persistent queues

**Goal**: Enable asynchronous, persistent inter-module communication

### Future Roadmap 🚀

- **Microservices Migration**
  - Extract modules as independent services
  - Deploy with container orchestration (Kubernetes)
  - Service mesh for communication (Istio)

- **Event Sourcing**
  - Store all domain events
  - Rebuild state from event log
  - Audit trail and time travel

- **Horizontal Scaling**
  - Stateless service design (already achieved)
  - Load balancer configuration
  - Database read replicas

- **Additional Features**
  - Transactions management
  - Budgets and categories
  - Reports and analytics
  - Notifications system

## Architectural Decisions

### Why Multiple Databases?

**Decision**: Each module has its own database

**Rationale**:
- ✅ Prepares for microservices migration
- ✅ Enforces bounded context isolation
- ✅ Prevents tight coupling
- ✅ Enables independent scaling
- ✅ Allows different database technologies per module

**Trade-offs**:
- ❌ Eventual consistency (not immediate)
- ❌ No foreign key constraints across modules
- ❌ More complex queries (can't join across databases)

### Why Kysely over ORM?

**Decision**: Use Kysely instead of TypeORM/Prisma

**Rationale**:
- ✅ 100% type safety without code generation overhead
- ✅ Full SQL control (no abstraction leakage)
- ✅ Better performance (no ORM overhead)
- ✅ No magic (explicit SQL queries)
- ✅ Easy to optimize complex queries

**Trade-offs**:
- ❌ More verbose than ORM (write more SQL)
- ❌ No built-in relations (manual joins)

### Why CQRS?

**Decision**: Separate commands and queries

**Rationale**:
- ✅ Clear separation of concerns
- ✅ Easier testing (focused handlers)
- ✅ Independent scaling (read/write optimization)
- ✅ Event sourcing ready
- ✅ Better code organization

**Trade-offs**:
- ❌ More files and boilerplate
- ❌ Learning curve for developers

### Why Event-Driven?

**Decision**: Modules communicate via events

**Rationale**:
- ✅ Loose coupling between modules
- ✅ Asynchronous processing
- ✅ Audit trail (event log)
- ✅ Microservices ready
- ✅ Resilience (can replay events)

**Trade-offs**:
- ❌ Eventual consistency
- ❌ Debugging complexity
- ❌ Need message broker infrastructure

### Why Anti-Corruption Layer?

**Decision**: Translate events between contexts

**Rationale**:
- ✅ Prevents domain model contamination
- ✅ Modules evolve independently
- ✅ Clear translation boundaries
- ✅ Easier testing (mock translations)
- ✅ Protects domain integrity

**Trade-offs**:
- ❌ Additional code (mappers, handlers)
- ❌ More complexity

## Resources

### Documentation
- [NestJS Documentation](https://docs.nestjs.com)
- [Kysely Documentation](https://kysely.dev)
- [CQRS in NestJS](https://docs.nestjs.com/recipes/cqrs)

### Domain-Driven Design
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Martin Fowler on DDD](https://martinfowler.com/tags/domain%20driven%20design.html)
- [DDD Aggregates](https://martinfowler.com/bliki/DDD_Aggregate.html)

### CQRS & Event Sourcing
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

### Microservices
- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [Database per Service](https://microservices.io/patterns/data/database-per-service.html)

## License

MIT
