# Seminar 10: Implementing Message Queues with RabbitMQ

In this seminar, you will enhance the Finance Manager application by implementing message queues using RabbitMQ. This will allow you to build a more loosely coupled, scalable system where modules can communicate asynchronously through events.

This will allow us to easily create microservices out of our code later on.

## Background

Message queues are a powerful architectural pattern for building distributed systems. They allow different parts of your application to communicate asynchronously, which improves scalability, reliability, and decouples system components.

RabbitMQ is one of the most popular message brokers that implements the Advanced Message Queuing Protocol (AMQP). It's a robust and mature solution that can handle high throughput and provides features like message acknowledgments, persistence, routing, and more.

## Objective

Integrate RabbitMQ into the Finance Manager application to enable asynchronous communication between modules. You will implement a publisher-subscriber pattern that works with the existing CQRS architecture, allowing domain events to be published and consumed across module boundaries.

## Instructions

### 0. Look how the project changed again

There has been a big change in the architecture since last time. Each of the separate modules has its own schema/db.
There is still one db instance running, but there is no way for the modules to have access to other module data.

To have loose coupling between modules, and to still have access to e.g. users inside of `Auth` we have to duplicate users inside of `Auth` db.

There have been examples of Anti Corruption Layer handlers, but right now there are only event handlers, as it should be.
Inside of event handlers we map events from different domain into our domain representation of the object.

### 1. Set Up RabbitMQ in Docker

First, update the `docker-compose.yml` file to include RabbitMQ:

```yaml
services:
  # Existing services...
  
  rabbitmq:
    container_name: finance-manager-rabbitmq
    image: rabbitmq:3-management
    ports:
      - "5672:5672"  # AMQP protocol port
      - "15672:15672"  # Management UI port
    networks:
      - app-network
    env_file:
      - docker.env
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  rabbitmq_data:
```

Add the following environment variables to your `.env` and `docker.env` files:

```
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin
RABBITMQ_URI=amqp://admin:admin@localhost:5672
```

### 2. Create RabbitMQ Integration Infrastructure

Create a RabbitMQ module in the shared-kernel infrastructure:

```
mkdir -p src/modules/shared-kernel/infrastructure/rabbitmq
```

#### Publisher Implementation

Create a publisher that implements the CQRS `IEventPublisher` interface:

```typescript
// src/modules/shared-kernel/infrastructure/rabbitmq/rabbitmq-publisher.ts
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";
import { IEventPublisher } from "@nestjs/cqrs";

@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
    constructor(private readonly amqpConnection: AmqpConnection) {}

    connect(): void {}

    publish<T>(event: T): void {
        this.amqpConnection.publish(
            "", // Exchange name (empty string for default exchange)
            event.constructor.name, // Use event class name as routing key
            JSON.stringify(event)
        );
    }
}
```

#### Subscriber Implementation

Create a subscriber that implements the CQRS `IMessageSource` interface:

```typescript
// src/modules/shared-kernel/infrastructure/rabbitmq/rabbitmq-subscriber.ts
import { Inject } from "@nestjs/common";
import { IEvent, IMessageSource } from "@nestjs/cqrs";
import { Subject } from "rxjs";

import { AmqpConnection, Nack } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
    private bridge: Subject<unknown>;
    
    constructor(
        private readonly amqpConnection: AmqpConnection,
        @Inject("EVENTS")
        private readonly events: Array<object & { name: string }>,
    ) {}

    connect() {
        this.events.forEach(async (event) => {
            await this.amqpConnection.createSubscriber<string>(
                (message) => {
                    if (this.bridge && message) {
                        const parsedJson = JSON.parse(message);
                        const receivedEvent = new event(parsedJson);
                        this.bridge.next(receivedEvent);
                        return new Nack(false);
                    }
                },
                {
                    errorHandler: (channel, msg, e) => {
                        throw e;
                    },
                    queue: event.name,
                },
                `handler_${event.name}`,
            );
        });
    }

    bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
        this.bridge = subject;
    }
}
```

### 3. Update Module Configurations

Update your application modules to use RabbitMQ for event publishing and subscribing:

```typescript
// Example: auth.module.ts
@Module({
    imports: [
        CqrsModule,
        // ... other imports
        RabbitMQModule.forRootAsync({
            imports: [EnvModule],
            inject: [EnvService],
            useFactory: (envService: EnvService<RabbitmqEnv>) => {
                return {
                    uri: envService.get("RABBITMQ_URI"),
                    connectionInitOptions: { wait: false },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        // ... other providers
        {
            provide: "EVENTS",
            useValue: events,
        },
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
        await this.rbmqSubscriber.connect();
        this.rbmqSubscriber.bridgeEventsTo(this.event$.subject$);

        this.rbmqPublisher.connect();
        this.event$.publisher = this.rbmqPublisher;
    }
}
```

### 4. Test Event Publishing and Consuming

Create an event handler for one of your domain events:

```typescript
// Example anti-corruption layer for cross-module events
export class UserUpdatedMappedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly email: string | undefined,
        public readonly name: string | undefined,
    ) {}
}

export class UserUpdatedEventHandler {
    constructor(private readonly eventBus: EventBus) {}

    async consumerHandler(event: UserUpdatedEvent): Promise<void> {
        if (!event) return;

        const mappedEvent = new UserUpdatedMappedEvent(
            event.id, 
            event.email, 
            event.name
        );

        await this.eventBus.publish(mappedEvent);
    }
}
```


## Hints for Implementation

1. **Where to Look:** 
   - Start by examining the environment configuration in `src/modules/shared-kernel/infrastructure/env-config/env.schema.ts`
   - Look at the existing event implementations in each module's `core/events` directory

2. **Implement Step by Step:**
   - First add RabbitMQ to docker-compose
   - Then create the rabbitmq infrastructure with publisher and subscriber
   - Update modules to use RabbitMQ for event communication
   - Test with existing events

3. **Testing Your Implementation:**
   - The RabbitMQ management interface will be available at http://localhost:15672/
   - Use username `guest` and password `guest` to log in
   - You can monitor queues, exchanges, and messages

## Resources

- [RabbitMQ Official Documentation](https://www.rabbitmq.com/documentation.html)
- [NestJS CQRS Documentation](https://docs.nestjs.com/recipes/cqrs)
- [@golevelup/nestjs-rabbitmq](https://github.com/golevelup/nestjs/tree/master/packages/rabbitmq)
- [Message Queuing Patterns](https://www.enterpriseintegrationpatterns.com/patterns/messaging/)
