# RabbitMQ-based CQRS Implementation

This document explains how RabbitMQ has been integrated as the event bus for the CQRS (Command Query Responsibility Segregation) pattern in the Finance Manager application.

## Overview

The application replaces NestJS's default in-memory event bus with a RabbitMQ-based implementation. This allows for:

1. Distributed event processing across multiple service instances
2. Reliable event delivery with persistence
3. Better scalability for event-driven systems
4. Asynchronous event handling

## Architecture

### Components

1. **RabbitMQEventBus**: A custom implementation of NestJS's `IEventBus` that:
   - Publishes domain events to RabbitMQ
   - Consumes events from RabbitMQ
   - Bridges to the local event handlers

2. **RabbitMQEventBusModule**: A module that:
   - Provides the RabbitMQEventBus as the implementation for EventBus
   - Configures the connection to RabbitMQ

3. **Event Handlers**: Classes decorated with `@EventsHandler` that:
   - Handle domain events
   - Perform side effects when events occur

### Flow

1. Domain entities (aggregates) publish events via `this.apply(new SomeEvent())`
2. The RabbitMQEventBus serializes and publishes these events to RabbitMQ
3. All service instances consume events from RabbitMQ
4. Event handlers across all services process the events

## How to Use

### 1. Import the RabbitMQEventBusModule

Replace the standard CqrsModule with the RabbitMQEventBusModule in your feature modules:

```typescript
@Module({
  imports: [
    // Replace CqrsModule with RabbitMQEventBusModule
    RabbitMQEventBusModule,
    // ...other imports
  ],
  // ...
})
export class YourModule {}
```

### 2. Create Domain Events

Event classes implement the IEvent interface:

```typescript
import { IEvent } from '@nestjs/cqrs';

export class SomethingHappenedEvent implements IEvent {
  constructor(
    public readonly entityId: string,
    public readonly userId: string,
    // ...other properties
  ) {}
}
```

### 3. Apply Events in Aggregates

Use the `apply()` method to dispatch events:

```typescript
// Inside an aggregate (AggregateRoot)
public doSomething(): void {
  // ...business logic
  
  // Apply the event
  this.apply(new SomethingHappenedEvent(this.id, this.userId));
}
```

### 4. Create Event Handlers

Create handlers for each event:

```typescript
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SomethingHappenedEvent } from './events/something-happened.event';

@EventsHandler(SomethingHappenedEvent)
export class SomethingHappenedHandler implements IEventHandler<SomethingHappenedEvent> {
  async handle(event: SomethingHappenedEvent) {
    // Handle the event
    console.log(`Something happened: ${event.entityId}`);
    
    // Perform side effects
    // - Update other systems
    // - Send notifications
    // - Update reports
  }
}
```

### 5. Register Event Handlers

Add event handlers to your module's providers:

```typescript
@Module({
  // ...
  providers: [
    // ...other providers
    SomethingHappenedHandler,
  ],
})
export class YourModule {}
```

## Benefits of Using RabbitMQ for CQRS

1. **Scalability**: Events can be processed by multiple service instances.
2. **Resilience**: Events are persisted in RabbitMQ and won't be lost if a service crashes.
3. **Loose Coupling**: Services can evolve independently as long as the event structure remains compatible.
4. **Distributed Processing**: Different types of events can be processed by specialized services.

## Considerations

1. **Exactly-once Delivery**: RabbitMQ guarantees at-least-once delivery. Make sure your event handlers are idempotent.
2. **Event Versioning**: Consider adding version information to events for future compatibility.
3. **Message Size**: Keep events small. For large data, consider storing it externally and including references.
4. **Error Handling**: Implement proper error handling in event consumers. RabbitMQ allows for retries and dead-letter queues.

## Troubleshooting

1. **Events Not Being Processed**:
   - Check that RabbitMQ is running
   - Verify queue and exchange configurations
   - Ensure event handlers are properly registered

2. **Error in Event Handlers**:
   - Check logs for exceptions
   - Add try/catch blocks to prevent one event from crashing the consumer
   - Consider implementing a dead-letter queue for failed events

3. **Performance Issues**:
   - Adjust the prefetch count in RabbitMQ consumer
   - Consider using multiple queue instances for high-volume events
   - Monitor RabbitMQ's resource usage
