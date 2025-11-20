import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { UsersController } from "./api/controllers/users.controller";
import { CreateUserCommandHandler } from "./application/commands/create-user.handler";
import { UpdateUserCommandHandler } from "./application/commands/update-user.handler";
import { UpdateUserAdminCommandHandler } from "./application/commands/update-user-admin.handler";
import { RemoveUserCommandHandler } from "./application/commands/remove-user.handler";
import { ChangePasswordCommandHandler } from "./application/commands/change-password.handler";
import { GetAllUsersQueryHandler } from "./application/queries/get-all-users.handler";
import { GetUserByIdQueryHandler } from "./application/queries/get-user-by-id.handler";
import { GetUserByEmailQueryHandler } from "./application/queries/get-user-by-email.handler";
import { DatabaseModule } from "../shared-kernel/infrastructure/database/database.module";
import { UsersRepository } from "./infrastructure/database/repositories/users.repository";
import { UserAggregateRepository } from "./infrastructure/database/repositories/users-aggregate.repository";
import { UserConfigModule } from "./infrastructure/config/user-config.module";
import { UserConfigService } from "./infrastructure/config/user-config.service";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { RabbitMQPublisher } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-publisher";
import { RabbitMQSubscriber } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-subscriber";
import { UserRegisteredEvent } from "../auth/core/events/user-registered.event";
import { UserRegisteredEventHandler } from "./infrastructure/anti-corruption-layer/user-registered.mapper";
import { UserRegisteredMappedEventHandler } from "./application/events/user-registered.handler";

const commandHandlers = [
    CreateUserCommandHandler,
    UpdateUserCommandHandler,
    UpdateUserAdminCommandHandler,
    RemoveUserCommandHandler,
    ChangePasswordCommandHandler,
];

const queryHandlers = [
    GetUserByIdQueryHandler,
    GetUserByEmailQueryHandler,
    GetAllUsersQueryHandler,
];

const eventHandlers = [UserRegisteredEventHandler, UserRegisteredMappedEventHandler];

// Events to subscribe to via RabbitMQ
const events = [UserRegisteredEvent];

@Module({
    imports: [
        CqrsModule,
        UserConfigModule,
        RabbitMQModule.forRootAsync({
            imports: [UserConfigModule],
            inject: [UserConfigService],
            useFactory: (configService: UserConfigService) => ({
                uri: configService.rabbitmqUri,
                connectionInitOptions: { wait: false },
            }),
        }),
        DatabaseModule.forFeatureAsync({
            imports: [UserConfigModule],
            injects: [UserConfigService],
            // @ts-ignore
            useFactory: (configService: UserConfigService) => ({
                host: configService.postgresHost,
                port: configService.postgresPort,
                user: configService.postgresUser,
                password: configService.postgresPassword,
                database: configService.postgresDB,
            }),
            inject: [UserConfigService],
        }),
    ],
    controllers: [UsersController],
    providers: [
        {
            provide: "IUsersRepository",
            useClass: UsersRepository,
        },
        {
            provide: "IUsersAggregateRepository",
            useClass: UserAggregateRepository,
        },
        ...commandHandlers,
        ...queryHandlers,
        ...eventHandlers,
        {
            provide: "EVENTS",
            useValue: events,
        },
        RabbitMQPublisher,
        RabbitMQSubscriber,
    ],
})
export class UsersModule implements OnModuleInit {
    constructor(
        private readonly event$: EventBus,
        private readonly rbmqPublisher: RabbitMQPublisher,
        private readonly rbmqSubscriber: RabbitMQSubscriber,
    ) {}

    async onModuleInit() {
        // Connect RabbitMQ subscriber and bridge to event bus
        await this.rbmqSubscriber.connect();
        this.rbmqSubscriber.bridgeEventsTo(this.event$.subject$);

        // Connect RabbitMQ publisher and set as event bus publisher
        this.rbmqPublisher.connect();
        this.event$.publisher = this.rbmqPublisher;

        console.log("[Users Module] RabbitMQ connected successfully");
    }
}
