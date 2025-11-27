import { Inject } from "@nestjs/common";
import { IEvent, IMessageSource } from "@nestjs/cqrs";
import { Subject } from "rxjs";

import {
  AmqpConnection,
  Nack,
  SubscribeResponse,
} from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";

interface EventConstructor<T extends IEvent> {
  new (...args: unknown[]): T;
  name: string;
}

@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
  private bridge: Subject<unknown>;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    @Inject("EVENTS")
    private readonly events: Array<EventConstructor<IEvent>>,
  ) {}

  async connect() {
    for (const Event of this.events) {
      await this.amqpConnection.createSubscriber<string>(
        (message): Promise<SubscribeResponse> => {
          if (this.bridge && message) {
            try {
              const parsedJson = JSON.parse(message) as Record<string, unknown>;

              const receivedEvent = new Event(parsedJson);

              console.log(receivedEvent);
              this.bridge.next(receivedEvent);
              return Promise.resolve(new Nack(false));
            } catch (error) {
              console.error("Error processing message:", error);
              return Promise.resolve(new Nack(false));
            }
          }
          return Promise.resolve(new Nack(false));
        },
        {
          errorHandler: (_channel, _msg, e) => {
            console.error("Subscriber error:", e);
            throw e;
          },
          queue: Event.name,
        },
        `handler_${Event.name}`,
      );
    }
  }

  bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
    this.bridge = subject as unknown as Subject<unknown>;
  }
}
