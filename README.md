# Seminar 11: Converting Modulith to Microservices

In this seminar, you will convert our Finance Manager application from a modulith architecture to a microservices architecture. This transformation will allow each module to run as an independent service, improving scalability, deployment flexibility, and team autonomy.

## Background

In Seminar 10, we implemented message queues with RabbitMQ to enable asynchronous communication between modules. This laid the groundwork for our transition to microservices by establishing a communication mechanism that works across process boundaries.

A microservices architecture divides an application into smaller, independently deployable services. Each service is responsible for a specific business capability and can be developed, deployed, and scaled independently. This architecture offers benefits like:

- **Scalability**: Scale individual services based on their specific needs
- **Resilience**: Isolate failures to specific services rather than bringing down the entire system
- **Technological flexibility**: Use different technologies for different services
- **Team autonomy**: Enable separate teams to work independently on different services

## Objective

Convert the Finance Manager application from a modulith to a microservices architecture by:

1. Creating separate services for Users, Auth, and Accounts
2. Setting up a shared-kernel package with common code
3. Implementing an API Gateway to route requests to appropriate services
4. Ensuring communication between services using RabbitMQ

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
3. Set up independent configuration for each service
4. Create separate database schemas for each service

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

Create an API Gateway that:

1. Routes requests to the appropriate services
2. Handles authentication before forwarding requests
3. Implements simple request/response patterns to services

```typescript
// Example: api-gateway client for users service
@Injectable()
export class UsersServiceClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private baseUrl = this.configService.get<string>('USERS_SERVICE_URL');

  async getUser(id: string, token: string): Promise<User> {
    const response = await this.httpService.axiosRef.get(
      `${this.baseUrl}/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  }
}
```

### 5. Implementing Cross-Service Communication with RabbitMQ

Services need to communicate asynchronously. Set up RabbitMQ for event-driven communication:

```typescript
// Publisher in users-service
@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publish<T>(event: T): void {
    this.amqpConnection.publish(
      'events_exchange', // Exchange name
      event.constructor.name, // Use event class name as routing key
      event
    );
  }
}

// Subscriber in auth-service
@Injectable()
export class UserUpdatedEventHandler {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}
  
  @RabbitSubscribe({
    exchange: 'events_exchange',
    routingKey: 'UserUpdatedEvent',
    queue: 'auth_user_updates',
  })
  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    // Update the local user data in auth service
    await this.usersRepository.updateUser(event.id, {
      email: event.email,
      name: event.name,
    });
  }
}
```

### 6. Implementing Anti-Corruption Layers

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

## Running Multiple Services Locally

To run all services locally for development:

```bash
# Terminal 1: Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Terminal 2: Run the users service
cd apps/users-service
npm run start:dev

# Terminal 3: Run the auth service 
cd apps/auth-service
npm run start:dev

# Terminal 4: Run the accounts service
cd apps/accounts-service
npm run start:dev

# Terminal 5: Run the API gateway
cd apps/api-gateway
npm run start:dev
```

Or use the shortcut commands from the root package.json:

```bash
# Run a specific service in development mode
npm run dev:accounts
npm run dev:users
npm run dev:auth
npm run dev:gateway
```

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
