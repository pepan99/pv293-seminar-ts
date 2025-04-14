import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { RabbitMQEventBus } from "./rabbitmq-event-bus";
import { RabbitMQModule } from "../rabbitmq/rabbitmq.module";
import { EnvModule } from "../env-config/env.module";

@Module({
    imports: [CqrsModule, RabbitMQModule, EnvModule],
    providers: [
        {
            provide: EventBus,
            useClass: RabbitMQEventBus,
        },
    ],
    exports: [EventBus],
})
export class RabbitMQEventBusModule implements OnModuleInit {
    constructor(private readonly eventBus: EventBus) {}

    onModuleInit() {
        // This is where the event handlers would typically be registered,
        // but since we're using the existing event handlers, we don't need to do anything here
    }
}
