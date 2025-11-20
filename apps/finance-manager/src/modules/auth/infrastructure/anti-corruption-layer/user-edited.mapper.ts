import { EventBus, EventsHandler, IEvent, IEventHandler } from "@nestjs/cqrs";
import { UserUpdatedEvent } from "../../../users/core/events/user-updated.event";

export class UserUpdatedMappedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly email: string | undefined,
        public readonly name: string | undefined,
    ) {}
}

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedEventHandler implements IEventHandler<UserUpdatedEvent> {
    constructor(private readonly eventBus: EventBus) {}

    async handle(event: UserUpdatedEvent): Promise<void> {
        if (!event) return;

        const mappedEvent = new UserUpdatedMappedEvent(event.id, event.email, event.name);

        await this.eventBus.publish(mappedEvent);
    }
}
