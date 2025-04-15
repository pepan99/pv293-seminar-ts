import { EventBus, EventsHandler, IEvent, IEventHandler } from "@nestjs/cqrs";
import { UserRole } from "../../core/types/db";
import { UserRegisteredEvent } from "shared-kernel/src/core/events/user-registered.event";

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
export class UserUpdatedEventHandler
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(private readonly eventBus: EventBus) {}

  handle(event: UserRegisteredEvent) {
    const mappedEvent = new UserRegisteredMappedEvent(
      event.id,
      event.name,
      event.email,
      event.password,
      event.createdAt,
      event.updatedAt,
      event.roles,
    );

    this.eventBus.publish(mappedEvent);
  }
}
