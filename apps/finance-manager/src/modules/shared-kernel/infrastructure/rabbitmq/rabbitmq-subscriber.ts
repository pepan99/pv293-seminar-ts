import { Inject, Injectable, Logger } from "@nestjs/common";
import { IEvent, IMessageSource } from "@nestjs/cqrs";
import { Subject } from "rxjs";
import { AmqpConnection, Nack } from "@golevelup/nestjs-rabbitmq";

// Event constructor type - accepts any number of parameters to support different event signatures
type EventConstructor<T extends IEvent = IEvent> = new (...args: unknown[]) => T;

@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
    private readonly logger = new Logger(RabbitMQSubscriber.name);
    private bridge?: Subject<IEvent>;

    constructor(
        private readonly amqpConnection: AmqpConnection,
        @Inject("EVENTS")
        private readonly events: EventConstructor[],
    ) {}

    async connect(): Promise<void> {
        if (this.events.length === 0) {
            this.logger.warn("No events to subscribe to");
            return;
        }

        // Use Promise.all to wait for all subscribers to be created
        await Promise.all(
            this.events.map(async (event) => {
                try {
                    await this.amqpConnection.createSubscriber<string>(
                        async (message) => {
                            return await this.handleMessage(event, message);
                        },
                        {
                            errorHandler: (channel, msg, error) => {
                                this.logger.error(
                                    `Error in RabbitMQ subscriber for ${event.name}`,
                                    error instanceof Error ? error.stack : String(error),
                                );
                            },
                            queue: event.name,
                        },
                        `handler_${event.name}`,
                    );

                    this.logger.log(`Subscribed to queue: ${event.name}`);
                } catch (error) {
                    this.logger.error(
                        `Failed to create subscriber for ${event.name}`,
                        error instanceof Error ? error.stack : String(error),
                    );
                    throw error;
                }
            }),
        );
    }

    private async handleMessage(
        eventConstructor: EventConstructor,
        message?: string,
    ): Promise<void | Nack> {
        if (!this.bridge) {
            this.logger.warn(
                `Bridge not initialized, message for ${eventConstructor.name} will be requeued`,
            );
            return new Nack(true); // Requeue
        }

        if (!message) {
            this.logger.warn(`Empty message received for ${eventConstructor.name}`);
            return; // Ack empty message
        }

        try {
            const parsedJson: unknown = JSON.parse(message);
            const receivedEvent = new eventConstructor(parsedJson);

            this.bridge.next(receivedEvent);
            this.logger.debug(`Processed event: ${eventConstructor.name}`);

            // Return void to acknowledge the message
            return;
        } catch (error) {
            this.logger.error(
                `Failed to process message for ${eventConstructor.name}`,
                error instanceof Error ? error.stack : String(error),
            );

            // Nack without requeue - message goes to DLQ if configured
            return new Nack(false);
        }
    }

    bridgeEventsTo<T extends IEvent>(subject: Subject<T>): void {
        // Type assertion needed because Subject<T> where T extends IEvent
        // is not directly assignable to Subject<IEvent> due to variance
        this.bridge = subject as unknown as Subject<IEvent>;
        this.logger.log("Event bridge connected");
    }
}
