import { EventBus, IEvent } from "@nestjs/cqrs";

// Example of an event class we want to handle
export class ExampleUserEvent implements IEvent {
    constructor(
        public readonly userId: string,
        public readonly data: string,
    ) {}
}

// Example of an event we want to transform and publish
export class MappedUserEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly transformedData: string,
    ) {}
}

// TODO: Implement this event handler
export class UserEventHandler {
    constructor(private readonly eventBus: EventBus) {}

    // This method will be called when the original event is received
    async consumerHandler(event: ExampleUserEvent): Promise<void> {
        if (!event) return;

        console.log(`Received user event for user: ${event.userId}`);

        // TODO: Transform the event data as needed
        const mappedEvent = new MappedUserEvent(event.userId, `Transformed: ${event.data}`);

        // Publish the mapped event to the event bus
        await this.eventBus.publish(mappedEvent);
    }
}
