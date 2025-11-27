import { Injectable, Logger } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { EventBus } from "@nestjs/cqrs";
import { UserUpdatedEvent } from "shared-kernel";
import { UserUpdatedMappedEvent } from "./user-updated.mapper";

@Injectable()
export class UserEventsSubscriber {
  private readonly logger = new Logger(UserEventsSubscriber.name);

  constructor(private readonly eventBus: EventBus) {}

  @RabbitSubscribe({
    exchange: "events_exchange",
    routingKey: "UserUpdatedEvent",
    queue: "auth_user_updates",
    queueOptions: {
      durable: true,
    },
  })
  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    this.logger.log(`Received UserUpdatedEvent for user ${event.id}`);

    if (!event || !event.id) {
      this.logger.warn("Received invalid UserUpdatedEvent");
      return;
    }

    const mappedEvent = new UserUpdatedMappedEvent(
      event.id,
      event.email,
      event.name,
    );

    this.eventBus.publish(mappedEvent);
  }
}
