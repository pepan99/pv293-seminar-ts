import { Module, OnModuleInit } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./api/controllers/auth.controller";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { LoginCommandHandler } from "./application/commands/login.handler";
import { RefreshTokenCommandHandler } from "./application/commands/refresh-token.handler";
import { RegisterCommandHandler } from "./application/commands/register.handler";
import { ValidateTokenCommandHandler } from "./application/commands/validate-token.handler";
import { DatabaseModule } from "../shared-kernel/infrastructure/database/database.module";
import { UsersRepository } from "./infrastructure/database/repositories/users.repository";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { AuthConfigModule } from "./infrastructure/config/auth-config.module";
import { AuthConfigService } from "./infrastructure/config/auth-config.service";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { RabbitMQPublisher } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-publisher";
import { RabbitMQSubscriber } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-subscriber";
import { UserUpdatedEvent } from "../users/core/events/user-updated.event";
import { UserUpdatedEventHandler } from "./infrastructure/anti-corruption-layer/user-edited.mapper";
import { UserUpdatedEventHandler as UserUpdatedMappedEventHandler } from "./application/events/users-updated.handler";

const commandHandlers = [
    LoginCommandHandler,
    RefreshTokenCommandHandler,
    RegisterCommandHandler,
    ValidateTokenCommandHandler,
];

const strategies = [JwtStrategy];

const eventHandlers = [UserUpdatedEventHandler, UserUpdatedMappedEventHandler];

// Events to subscribe to via RabbitMQ
const events = [UserUpdatedEvent];

@Module({
    imports: [
        CqrsModule,
        AuthConfigModule,
        RabbitMQModule.forRootAsync({
            imports: [AuthConfigModule],
            inject: [AuthConfigService],
            useFactory: (configService: AuthConfigService) => {
                return {
                    uri: configService.rabbitmqUri,
                    connectionInitOptions: { wait: false },
                };
            },
        }),
        DatabaseModule.forFeatureAsync({
            imports: [AuthConfigModule],
            injects: [AuthConfigService],
            // @ts-ignore
            useFactory: (configService: AuthConfigService) => ({
                host: configService.postgresHost,
                port: configService.postgresPort,
                user: configService.postgresUser,
                password: configService.postgresPassword,
                database: configService.postgresDB,
            }),
            inject: [AuthConfigService],
        }),
        PassportModule,
        JwtModule.registerAsync({
            imports: [AuthConfigModule],
            useFactory: (configService: AuthConfigService) => ({
                secret: configService.jwtSecret,
                signOptions: {
                    expiresIn: "1h",
                },
            }),
            inject: [AuthConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: "IUsersRepository",
            useClass: UsersRepository,
        },
        ...commandHandlers,
        ...eventHandlers,
        ...strategies,
        AuthConfigService,
        ConfigService,
        {
            provide: "EVENTS",
            useValue: events,
        },
        RabbitMQPublisher,
        RabbitMQSubscriber,
    ],
})
export class AuthModule implements OnModuleInit {
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

        console.log("[Auth Module] RabbitMQ connected successfully");
    }
}
