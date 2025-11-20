import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger } from "@nestjs/common";
import { IEventPublisher } from "@nestjs/cqrs";

type WithConstructor = { constructor: { name: string } };

@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
    private readonly logger = new Logger(RabbitMQPublisher.name);

    constructor(private readonly amqpConnection: AmqpConnection) {}

    connect(): void {
        // This method is required by the IEventPublisher interface
        // It's called when the publisher is registered with the EventBus
        this.logger.log("RabbitMQ Publisher connected");
    }

    async publish<T extends WithConstructor>(event: T): Promise<void> {
        const eventName = event.constructor.name;

        try {
            const serializedEvent = JSON.stringify(event);

            await this.amqpConnection.publish(
                "", // Exchange name (empty string for default exchange)
                eventName, // Use event class name as routing key
                serializedEvent,
            );

            this.logger.debug(`Published event: ${eventName}`);
        } catch (error) {
            this.logger.error(
                `Failed to publish event: ${eventName}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }
}
