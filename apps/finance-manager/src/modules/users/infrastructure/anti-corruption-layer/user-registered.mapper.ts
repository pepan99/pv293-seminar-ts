import { EventBus, EventsHandler, IEvent, IEventHandler } from "@nestjs/cqrs";
import { UserRegisteredEvent } from "../../../auth/core/events/user-registered.event";
import { UserRole } from "../../core/types/db";

export class UserRegisteredMappedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly password: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly roles: UserRole[],
    ) {}
}

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredEventHandler implements IEventHandler<UserRegisteredEvent> {
    constructor(private readonly eventBus: EventBus) {}

    async handle(event: UserRegisteredEvent): Promise<void> {
        if (!event) return;

        console.log("[Users Module] Received UserRegisteredEvent from Auth module");

        const mappedEvent = new UserRegisteredMappedEvent(
            event.id,
            event.name,
            event.email,
            event.password,
            event.createdAt,
            event.updatedAt,
            event.roles,
        );

        await this.eventBus.publish(mappedEvent);
    }
}
