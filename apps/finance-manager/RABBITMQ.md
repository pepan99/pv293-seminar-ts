# RabbitMQ Integration in Finance Manager

This document describes how RabbitMQ has been integrated into the Finance Manager application and how to use it.

## Overview

RabbitMQ is used in this application for:
- Asynchronous communication between services
- Reliable message delivery for important operations
- Decoupling services and improving scalability

## Getting Started

### 1. Start RabbitMQ

The RabbitMQ service is included in the docker-compose.yml file. To start it along with other services:

```bash
docker-compose up -d
```

This will start the RabbitMQ service with the Management UI available at:
- URL: http://localhost:15672
- Username: rabbitmq
- Password: rabbitmq

### 2. Environment Variables

Make sure your `.env` file includes these RabbitMQ-related variables:

```
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=rabbitmq
RABBITMQ_PASSWORD=rabbitmq
RABBITMQ_QUEUE=finance_queue
RABBITMQ_EXCHANGE=finance_exchange
RABBITMQ_ROUTING_KEY=finance_routing_key
```

## Architecture

1. **RabbitMQ Module**
   - Provides a service for interacting with RabbitMQ
   - Handles connection, publishing, and consuming messages

2. **Notification Module**
   - Uses RabbitMQ for sending notifications
   - Demonstrates a practical use case for messaging

## How to Use RabbitMQ in Your Services

### 1. Import the RabbitMQ Module

```typescript
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  // ...
})
export class YourModule {}
```

### 2. Inject and Use the RabbitMQ Service

```typescript
import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class YourService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async performAction() {
    // Publish a message
    await this.rabbitMQService.publish(
      { key: 'value' },
      'exchange_name',  // Optional, defaults to RABBITMQ_EXCHANGE from env
      'routing_key'     // Optional, defaults to RABBITMQ_ROUTING_KEY from env
    );
  }
}
```

### 3. Consuming Messages

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class YourConsumerService implements OnModuleInit {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    await this.rabbitMQService.consume(
      'queue_name',  // Optional, defaults to RABBITMQ_QUEUE from env
      async (message) => {
        // Process your message here
        console.log('Received message:', message);
      }
    );
  }
}
```

## Example: Notifications

The Notification Module demonstrates how to use RabbitMQ for sending notifications:

1. **Publishing a notification:**

```typescript
// Import the service
import { NotificationService } from '../notifications/notification.service';

// Inject it
constructor(private readonly notificationService: NotificationService) {}

// Use it
await this.notificationService.sendNotification({
  userId: 'user-id',
  message: 'Your action was completed successfully',
  type: 'success'
});
```

2. **The notification is processed asynchronously by a consumer that could:**
   - Send an email
   - Push a mobile notification
   - Update a notification center in the UI
   - Store the notification in the database

## Advanced Usage

### Creating Custom Queues and Exchanges

```typescript
// Create a queue
await this.rabbitMQService.createQueue(
  'custom_queue',
  'custom_exchange',  // Optional
  'custom_routing_key'  // Optional
);

// Create an exchange
await this.rabbitMQService.createExchange(
  'custom_exchange',
  'direct'  // Exchange type: 'direct', 'fanout', 'topic', or 'headers'
);
```

## Troubleshooting

1. **Connection Issues**
   - Verify that RabbitMQ is running: `docker-compose ps`
   - Check your environment variables
   - Inspect RabbitMQ logs: `docker-compose logs rabbitmq`

2. **Management UI**
   - Access the RabbitMQ Management UI at http://localhost:15672
   - Use it to monitor queues, exchanges, and messages

3. **Common Errors**
   - `ECONNREFUSED`: RabbitMQ is not running or not accessible
   - `401 Unauthorized`: Incorrect credentials
   - `404 Not Found`: Queue or exchange doesn't exist
