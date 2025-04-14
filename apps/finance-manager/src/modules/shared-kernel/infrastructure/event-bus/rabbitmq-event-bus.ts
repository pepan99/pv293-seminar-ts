import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { EventBus, IEvent, IEventBus } from "@nestjs/cqrs";
import { ModuleRef } from "@nestjs/core";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { EnvService } from "../env-config/env.service";
import { Observable, Subject } from "rxjs";

export interface EventData {
    type: string;
    data: any;
}

@Injectable()
export class RabbitMQEventBus implements IEventBus, OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQEventBus.name);
    private subject$ = new Subject<IEvent>();
    private readonly EVENTS_EXCHANGE = "events_exchange";
    private readonly EVENTS_ROUTING_KEY = "events";
    private readonly EVENTS_QUEUE = "events_queue";

    constructor(
        private readonly eventBus: EventBus,
        private readonly moduleRef: ModuleRef,
        private readonly rabbitMQService: RabbitMQService,
        private readonly envService: EnvService,
    ) {}

    async onModuleInit() {
        this.subject$.subscribe((event) => {
            this.eventBus.subject$.next(event);
        });

        // Set up RabbitMQ event exchange and queue
        await this.rabbitMQService.createExchange(this.EVENTS_EXCHANGE, "topic");
        await this.rabbitMQService.createQueue(
            this.EVENTS_QUEUE,
            this.EVENTS_EXCHANGE,
            this.EVENTS_ROUTING_KEY,
        );

        // Start consuming events
        await this.startConsuming();

        this.logger.log("RabbitMQ event bus initialized");
    }

    onModuleDestroy() {
        this.subject$.complete();
    }

    /**
     * Publish an event to RabbitMQ
     */
    async publish<T extends IEvent>(event: T): Promise<void> {
        const eventType = this.getEventName(event);
        const eventData: EventData = {
            type: eventType,
            data: event,
        };

        this.logger.debug(`Publishing event ${eventType} to RabbitMQ`);

        await this.rabbitMQService.publish(
            eventData,
            this.EVENTS_EXCHANGE,
            this.EVENTS_ROUTING_KEY,
        );
    }

    /**
     * Begin consuming events from RabbitMQ and dispatching them to the local event bus
     */
    private async startConsuming(): Promise<void> {
        await this.rabbitMQService.consume<EventData>(this.EVENTS_QUEUE, async (message) => {
            const { type, data } = message;
            this.logger.debug(`Received event ${type} from RabbitMQ`);

            // Dispatch to the local event bus
            this.subject$.next(data);
        });
    }

    /**
     * Get the name of an event class
     */
    private getEventName(event: any): string {
        const { constructor } = Object.getPrototypeOf(event);
        return constructor.name;
    }

    /**
     * Bridge to the original event bus observable
     */
    get bridgeEventsTo$(): Observable<IEvent> {
        return this.eventBus.subject$.asObservable();
    }
}
