// @ts-nocheck
import { Inject } from "@nestjs/common";
import { IEvent, IMessageSource } from "@nestjs/cqrs";
import { Subject } from "rxjs";

import { AmqpConnection, Nack } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RabbitMQSubscriber implements IMessageSource {
  private bridge: Subject<unknown>;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    @Inject("EVENTS")
    private readonly events: Array<object & { name: string }>,
  ) {}

  connect() {
    this.events.forEach(async (event) => {
      await this.amqpConnection.createSubscriber<string>(
        (message) => {
          if (this.bridge && message) {
            const parsedJson = JSON.parse(message);
            const receivedEvent = new event(...Object.values(parsedJson));
            console.log(receivedEvent);
            this.bridge.next(receivedEvent);
            return new Nack(false);
          }
        },
        {
          errorHandler: (channel, msg, e) => {
            throw e;
          },
          queue: event.name,
        },
        `handler_${event.name}`,
      );
    });
  }

  bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
    this.bridge = subject;
  }
}
