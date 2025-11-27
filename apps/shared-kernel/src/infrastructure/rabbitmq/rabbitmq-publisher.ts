import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger } from "@nestjs/common";
import { IEventPublisher, IEvent } from "@nestjs/cqrs";

const EVENTS_EXCHANGE = "events_exchange";

@Injectable()
export class RabbitMQPublisher implements IEventPublisher {
  private readonly logger = new Logger(RabbitMQPublisher.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  connect(): void {}

  async publish<T extends IEvent>(event: T) {
    const routingKey = event.constructor.name;
    this.logger.log(
      `Publishing event ${routingKey} to exchange ${EVENTS_EXCHANGE}`,
    );

    await this.amqpConnection.publish(EVENTS_EXCHANGE, routingKey, event);
  }
}
