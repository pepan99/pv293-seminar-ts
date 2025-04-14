import { EventBus, IEvent } from "@nestjs/cqrs";
import { UserUpdatedEvent } from "shared-kernel/src";

export class UserUpdatedMappedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly email: string | undefined,
    public readonly name: string | undefined,
  ) { }
}

export class UserUpdatedEventHandler {
  constructor(private readonly eventBus: EventBus) { }

  async consumerHandler(event: UserUpdatedEvent): Promise<void> {
    if (!event) return;

    const mappedEvent = new UserUpdatedMappedEvent(
      event.id,
      event.email,
      event.name,
    );

    await this.eventBus.publish(mappedEvent);
  }
}
