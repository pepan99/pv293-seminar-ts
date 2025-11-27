# Seminar 11: Converting Modulith to Microservices

In this seminar, you will convert our Finance Manager application from a modulith architecture to a microservices architecture. This transformation will allow each module to run as an independent service, improving scalability, deployment flexibility, and team autonomy.

## Background

In Seminar 10, you built a modulith architecture where the Finance Manager application runs as a single NestJS application with separate modules (Auth, Users, Accounts). You implemented RabbitMQ for asynchronous event-driven communication between modules and established CQRS patterns with anti-corruption layers.

In this seminar, you'll extract these modules into independently deployable microservices. A microservices architecture divides an application into smaller services that can be developed, deployed, and scaled independently. Each service:

- Runs as its own process with dedicated resources
- Has its own database for data isolation
- Communicates with other services through well-defined interfaces
- Can fail without bringing down the entire system

This architecture offers several benefits:

- **Scalability**: Scale individual services based on their specific load
- **Resilience**: Failures are isolated to specific services
- **Technological flexibility**: Each service can use different technologies
- **Team autonomy**: Teams can work independently on different services
- **Deployment independence**: Deploy and update services without affecting others

## Objective

Convert the Finance Manager application from a modulith to a microservices architecture. You will build four separate services:

1. **API Gateway** - Entry point for HTTP requests with JWT authentication
2. **Users Service** - User management and profiles
3. **Auth Service** - Authentication and token management
4. **Accounts Service** - Financial accounts management

Additionally, you'll create a **shared-kernel** package containing common code, events, and infrastructure utilities shared across services.

The final architecture uses:
- **RabbitMQ request-reply** for synchronous communication (API Gateway → Services)
- **RabbitMQ event-driven messaging** for asynchronous communication (Service → Service)
- **Separate PostgreSQL databases** for each service
- **Docker Compose** for orchestrating all services and dependencies

## Key Implementation Steps

### 1. Restructuring the Monorepo

The first step is to restructure our project into a proper monorepo with distinct services:

```
pv293-seminar-ts/
├── apps/
│   ├── accounts-service/    # Financial accounts management
│   ├── api-gateway/         # API gateway/BFF for clients
│   ├── auth-service/        # Authentication and authorization
│   ├── shared-kernel/       # Shared code between services
│   └── users-service/       # User management
├── packages/                # Shared configuration packages
│   ├── eslint-config/
│   ├── shared-types/
│   └── typescript-config/
└── pnpm-workspace.yaml      # Workspace configuration
```

### 2. Extracting Modules into Separate Services

For each module (Users, Auth, Accounts), create a separate NestJS application:

1. Create the service directory structure with proper NestJS setup
2. Move the module's controllers, services, entities, and infrastructure into the new service
3. Set up independent configuration for each service (environment variables, ports, etc.)
4. Configure separate PostgreSQL database instances for data isolation
5. Implement dual interface: HTTP REST API + RabbitMQ microservice
6. Set up Dockerfile for containerization

### 3. Implementing the Shared Kernel

The shared-kernel package contains code shared between services:

```typescript
// Example: shared-kernel/src/core/events/user-updated.event.ts
export class UserUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly name?: string,
    public readonly roles?: string[],
  ) {}
}
```

Make the shared-kernel available to all services through the workspace configuration.

### 4. Setting Up the API Gateway

The API Gateway acts as the single entry point for HTTP requests from clients. It handles authentication and routes requests to appropriate microservices using **RabbitMQ request-reply pattern**.

#### Gateway Module Setup

Register RabbitMQ clients for each service:

```typescript
// apps/api-gateway/src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
    // Register RabbitMQ clients for each microservice
    ClientsModule.register([
      {
        name: "USERS_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || "amqp://localhost:5672"],
          queue: "users_queue",
          queueOptions: { durable: true },
        },
      },
      {
        name: "AUTH_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI],
          queue: "auth_queue",
          queueOptions: { durable: true },
        },
      },
      {
        name: "ACCOUNTS_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI],
          queue: "accounts_queue",
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [UsersController, AuthController, AccountsController],
  providers: [JwtStrategy, RolesGuard],
})
export class AppModule {}
```

#### Gateway Controller

Controllers receive HTTP requests and send RabbitMQ messages to services:

```typescript
// apps/api-gateway/src/controllers/users.controller.ts
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {}

  @Get("profile")
  async getProfile(@User() user: any) {
    return firstValueFrom(
      this.usersClient.send("users.get_user_profile", {
        userId: user.userId,
      }),
    );
  }

  @Put("profile")
  async updateProfile(@User() user: any, @Body() dto: UpdateProfileDto) {
    return firstValueFrom(
      this.usersClient.send("users.update_user_profile", {
        userId: user.userId,
        dto,
      }),
    );
  }
}
```

**Key points:**
- Gateway uses `@Inject("USERS_SERVICE")` to inject the RabbitMQ client
- `client.send()` performs request-reply communication (returns Observable)
- `firstValueFrom()` converts Observable to Promise
- Message pattern format: `"service.operation"` (e.g., `"users.get_user_profile"`)

### 5. Service Architecture: Dual Interface Pattern

Each microservice exposes **two interfaces**:
1. **HTTP REST API** - For health checks and direct service access
2. **RabbitMQ Microservice** - For request-reply from the API Gateway

#### Service Main Setup

```typescript
// apps/users-service/src/main.ts
async function bootstrap() {
  // Create HTTP application
  const app = await NestFactory.create(UsersModule);

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Users Service API")
    .setDescription("API for managing users")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const usersConfig = app.get(UserConfigService);

  // Connect RabbitMQ microservice interface
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [usersConfig.rabbitmqUri || "amqp://localhost:5672"],
      queue: "users_queue",
      queueOptions: { durable: true },
    },
  });

  const appConfig = app.get(AppConfigService);

  // Start both HTTP and microservice interfaces
  await app.startAllMicroservices();
  await app.listen(appConfig.port);

  console.log(`Users service is running on ${await app.getUrl()}`);
}
bootstrap();
```

#### Service Controller with Message Patterns

Services handle requests from the API Gateway using `@MessagePattern`:

```typescript
// apps/users-service/src/api/controllers/users.controller.ts
@Controller()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern("users.get_user_profile")
  async getUserProfile(
    @Payload() data: { userId: string },
  ): Promise<UserWithoutPassword> {
    return this.queryBus.execute(new GetUserByIdQuery(data.userId));
  }

  @MessagePattern("users.update_user_profile")
  async updateUserProfile(
    @Payload() data: { userId: string; dto: UpdateUserDto },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(
      new UpdateUserCommand(data.userId, data.dto),
    );
  }
}
```

**Key points:**
- `@Controller()` without route means no HTTP routes (only message patterns)
- `@MessagePattern("pattern")` listens for RabbitMQ messages
- `@Payload()` extracts data from the message
- Handler returns data directly - NestJS handles serialization
- Services use CQRS internally (CommandBus/QueryBus)

### 6. Implementing Asynchronous Event-Driven Communication

While API Gateway uses RabbitMQ for **synchronous request-reply**, services use RabbitMQ for **asynchronous event-driven communication** between themselves. This pattern is crucial when services need to react to changes in other services without blocking.

#### Architecture Overview

Services publish domain events to RabbitMQ when important changes occur. Other services subscribe to these events and update their local data accordingly. This pattern implements eventual consistency across services.

#### RabbitMQ Publisher (Shared Kernel)

```typescript
// apps/shared-kernel/src/infrastructure/rabbitmq/rabbitmq-publisher.ts
@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  connect(): void {}

  async publish<T extends IEvent>(event: T) {
    // Uses empty exchange with event class name as routing key
    await this.amqpConnection.publish(
      "",  // Empty exchange (default direct exchange)
      event.constructor.name,  // Routing key = event class name
      JSON.stringify(event)
    );
  }
}
```

#### RabbitMQ Subscriber (Shared Kernel)

```typescript
// apps/shared-kernel/src/infrastructure/rabbitmq/rabbitmq-subscriber.ts
@Injectable()
export class RabbitMQSubscriber {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async connect(): Promise<void> {
    // Connection is handled by @golevelup/nestjs-rabbitmq
  }

  // Bridge RabbitMQ events to CQRS EventBus
  bridgeEventsTo(eventBusSubject: Subject<IEvent>): void {
    // Subscribe to all relevant event queues
    // When message arrives, deserialize and push to EventBus
  }
}
```

#### Event Bridging in Service Modules

Each service module connects RabbitMQ to its internal CQRS EventBus:

```typescript
// Example: apps/auth-service/src/auth.module.ts
@Module({
  imports: [
    CqrsModule.forRoot(),
    RabbitMQModule.forRootAsync({
      useFactory: (configService: AuthConfigService) => ({
        uri: configService.rabbitmqUri,
        connectionInitOptions: { wait: false },
      }),
      inject: [AuthConfigService],
    }),
    // ... other imports
  ],
  providers: [
    ...eventHandlers,
    RabbitMQPublisher,
    RabbitMQSubscriber,
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly event$: EventBus,
    private readonly rbmqPublisher: RabbitMQPublisher,
    private readonly rbmqSubscriber: RabbitMQSubscriber,
  ) {}

  async onModuleInit() {
    // Connect subscriber and bridge events to CQRS EventBus
    await this.rbmqSubscriber.connect();
    this.rbmqSubscriber.bridgeEventsTo(this.event$.subject$);

    // Connect publisher to EventBus
    this.rbmqPublisher.connect();
    this.event$.publisher = this.rbmqPublisher;
  }
}
```

**Key points:**
- Events flow: Service → CQRS EventBus → RabbitMQPublisher → RabbitMQ → RabbitMQSubscriber → CQRS EventBus → Event Handlers
- Empty exchange `""` uses RabbitMQ's default direct exchange
- Routing key is the event class name (e.g., `"UserUpdatedEvent"`)
- `bridgeEventsTo()` connects RabbitMQ to the service's internal EventBus
- This pattern allows services to use CQRS internally while communicating via RabbitMQ externally

### 7. Implementing Anti-Corruption Layers

Each service needs to translate events from other services into its own domain model:

```typescript
// Auth service's anti-corruption layer for User events
export class UserUpdatedMappedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly email: string | undefined,
    public readonly name: string | undefined,
  ) {}
}

export class UserEventHandler {
  constructor(private readonly eventBus: EventBus) {}

  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    const mappedEvent = new UserUpdatedMappedEvent(
      event.id, 
      event.email, 
      event.name
    );
    
    await this.eventBus.publish(mappedEvent);
  }
}
```

### 8. Database Isolation Strategy

Each microservice has its own dedicated PostgreSQL database instance. This ensures complete data isolation and service autonomy.

#### Database Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Users Service  │────▶│  postgres-users  │     │  Accounts Svc   │
│  (Port 3002)    │     │  (Port 5433)     │     │  (Port 3001)    │
└─────────────────┘     │  users_db        │     └─────────────────┘
                        └──────────────────┘              │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Auth Service   │────▶│  postgres-auth   │     │ postgres-accounts│
│  (Port 3003)    │     │  (Port 5434)     │     │ (Port 5432)      │
└─────────────────┘     │  auth_db         │     │ accounts_db      │
                        └──────────────────┘     └──────────────────┘
```

#### Service Database Configuration

Each service configures its own database connection:

```typescript
// apps/users-service/src/infrastructure/config/user-config.service.ts
@Injectable()
export class UserConfigService {
  constructor(private configService: ConfigService) {}

  get postgresHost(): string {
    return this.configService.get<string>("POSTGRES_HOST")!;
  }

  get postgresPort(): number {
    return this.configService.get<number>("POSTGRES_PORT")!;
  }

  get postgresDB(): string {
    return this.configService.get<string>("POSTGRES_DB")!;
  }

  // Users service connects to postgres-users container
}
```

#### Why Separate Databases?

1. **Data Ownership**: Each service owns and controls its data schema
2. **Independent Evolution**: Services can change schemas without coordinating
3. **Fault Isolation**: Database issues in one service don't affect others
4. **Scalability**: Scale databases independently based on service needs
5. **Security**: Services can't directly query other services' data

#### Handling Data Duplication

Services maintain local copies of data they need from other services:

```typescript
// Auth service keeps a local copy of user data
@EventsHandler(UserUpdatedEvent)
export class UserUpdatedEventHandler {
  constructor(
    private readonly authUsersRepository: AuthUsersRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: UserUpdatedEvent): Promise<void> {
    // Update local copy when user data changes
    const mappedEvent = new UserUpdatedMappedEvent(
      event.id,
      event.email,
      event.name,
    );
    await this.eventBus.publish(mappedEvent);
  }
}
```

**Trade-offs:**
- ✅ Service independence and resilience
- ✅ Clear ownership boundaries
- ❌ Data duplication across services
- ❌ Eventual consistency (not immediate)
- ❌ More complex data management

## Running Multiple Services with Docker Compose

The microservices architecture uses Docker Compose to orchestrate all services and dependencies. This ensures consistent development and deployment environments.

### Docker Compose Setup

The `docker-compose.yml` file defines:
- **4 microservices**: api-gateway, users-service, auth-service, accounts-service
- **3 PostgreSQL databases**: One for each data-owning service
- **1 RabbitMQ instance**: Shared message broker for all services

```yaml
services:
  api-gateway:
    build:
      context: .
      dockerfile: ./apps/api-gateway/Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - rabbitmq
      - accounts-service
      - users-service
      - auth-service
    environment:
      - RABBITMQ_URI=amqp://admin:admin@rabbitmq:5672

  users-service:
    build:
      context: .
      dockerfile: ./apps/users-service/Dockerfile
    ports:
      - "3002:3002"
    depends_on:
      postgres-users:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    environment:
      - POSTGRES_HOST=postgres-users
      - RABBITMQ_URI=amqp://admin:admin@rabbitmq:5672

  postgres-users:
    image: postgres:17-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: users_db
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"   # AMQP protocol
      - "15672:15672" # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Similar configuration for auth-service, accounts-service,
  # postgres-auth, and postgres-accounts...
```

### Running the Services

```bash
# Start all services with Docker Compose
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start (after code changes)
docker-compose up --build
```

### Service Ports

- **API Gateway**: http://localhost:3000
- **Users Service**: http://localhost:3002 (Swagger: /api)
- **Auth Service**: http://localhost:3003 (Swagger: /api)
- **Accounts Service**: http://localhost:3001 (Swagger: /api)
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)

### Database Connections

- **Users DB**: postgres://postgres:postgres@localhost:5433/users_db
- **Auth DB**: postgres://postgres:postgres@localhost:5434/auth_db
- **Accounts DB**: postgres://postgres:postgres@localhost:5432/accounts_db

**Key benefits:**
- Single command starts entire system
- Health checks ensure proper startup order
- Isolated databases per service
- Easy to tear down and rebuild

## Common Challenges and Solutions

### Data Duplication

**Challenge**: Services need local copies of data owned by other services.

**Solution**: Implement event handlers that keep local copies updated when the authoritative data changes.

```typescript
// Auth service keeps a copy of users
@Injectable()
export class UserUpdatedEventHandler {
  constructor(
    private readonly authUsersRepository: AuthUsersRepository,
  ) {}
  
  async handle(event: UserUpdatedMappedEvent): Promise<void> {
    await this.authUsersRepository.update(event.id, {
      email: event.email,
      name: event.name,
    });
  }
}
```

### Distributed Transactions

**Challenge**: Operations that span multiple services can't use database transactions.

**Solution**: Implement the Saga pattern or eventual consistency through events.

### Service Discovery

**Challenge**: Services need to know how to reach other services.

**Solution**: Use environment variables or a service registry.

```typescript
// API Gateway configuration
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class ApiGatewayModule {}
```

## Resources

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)
- [Message Patterns in Microservices](https://microservices.io/patterns/communication-style/messaging.html)
- [Event-Driven Architecture](https://microservices.io/patterns/data/event-driven-architecture.html)
- [Domain-Driven Design in Microservices](https://microservices.io/patterns/data/domain-event.html)
