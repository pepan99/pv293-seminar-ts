// @ts-nocheck
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";
import { IEventPublisher, IEvent } from "@nestjs/cqrs";

@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
    constructor(private readonly amqpConnection: AmqpConnection) {}

    connect(): void {}

    async publish<T extends IEvent>(event: T) {
        await this.amqpConnection.publish("", event.constructor.name, JSON.stringify(event));
    }
}
