import { Inject, Injectable } from "@nestjs/common";
import { IEvent, IMessageSource } from "@nestjs/cqrs";
import { Subject } from "rxjs";

// TODO: Import AmqpConnection and Nack from @golevelup/nestjs-rabbitmq

@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
    private bridge: Subject<unknown>;

    constructor(
        // TODO: Inject AmqpConnection
        @Inject("EVENTS")
        private readonly events: Array<object & { name: string }>,
    ) {}

    connect() {
        // TODO: For each event in this.events
        // 1. Create a subscriber with amqpConnection.createSubscriber
        // 2. Parse the message and create a new event instance
        // 3. Send the event to the bridge (this.bridge.next)
        // 4. Return a Nack to acknowledge the message

        console.log("[TODO] Connecting RabbitMQ subscriber");
        console.log(
            "Events to subscribe:",
            this.events.map((e) => e.name),
        );
    }

    bridgeEventsTo<T extends IEvent>(_subject: Subject<T>) {
        // This method bridges the RabbitMQ messages to the NestJS event bus
        // this.bridge = subject;
    }
}
