import { IEvent } from "@nestjs/cqrs";
import { UserUpdatedEvent } from "../../../users/core/events/user-updated.event";
import { Inject } from "@nestjs/common";
import { IRabbitmqPublisher } from "../../../shared-kernel/infrastructure/rabbitmq/rabbitmq.publisher";

export class UserUpdatedMappedEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly email: string | undefined,
        public readonly name: string | undefined,
    ) {}
}

export class UserUpdatedEventHandler {
    constructor(
        @Inject("IRabbitmqPublisher")
        private readonly messagePublisher: IRabbitmqPublisher,
    ) {}

    async consumerHandler(event: UserUpdatedEvent): Promise<void> {
        if (!event) return;

        const mappedEvent = new UserUpdatedMappedEvent(event.id, event.email, event.name);

        await this.messagePublisher.publishMessage(mappedEvent);
    }
}
