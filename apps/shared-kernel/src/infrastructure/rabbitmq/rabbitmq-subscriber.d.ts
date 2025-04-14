import { IEvent, IMessageSource } from "@nestjs/cqrs";
import { Subject } from "rxjs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
export declare class RabbitMQSubscriber implements IMessageSource {
  private readonly amqpConnection;
  private readonly events;
  private bridge;
  constructor(
    amqpConnection: AmqpConnection,
    events: Array<
      object & {
        name: string;
      }
    >,
  );
  connect(): void;
  bridgeEventsTo<T extends IEvent>(subject: Subject<T>): void;
}
