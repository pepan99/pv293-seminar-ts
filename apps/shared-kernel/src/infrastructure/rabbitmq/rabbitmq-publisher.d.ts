import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { IEventPublisher } from "@nestjs/cqrs";
export declare class RabbitMQPublisher implements IEventPublisher {
  private readonly amqpConnection;
  constructor(amqpConnection: AmqpConnection);
  connect(): void;
  publish<T>(event: T): void;
}
//# sourceMappingURL=rabbitmq-publisher.d.ts.map
