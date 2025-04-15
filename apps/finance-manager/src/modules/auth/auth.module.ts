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
import { UserUpdatedEvent } from "../users/core/events/user-updated.event";
import {
    UserUpdatedEventHandler,
    UserUpdatedMappedEvent,
} from "./infrastructure/anti-corruption-layer/user-edited.mapper";
import { TokenRefreshedEvent } from "./core/events/token-refreshed.event";
import { UserRegisteredEvent } from "./core/events/user-registered.event";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { RabbitMQPublisher } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-publisher";
import { RabbitMQSubscriber } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-subscriber";

const commandHandlers = [
    LoginCommandHandler,
    RefreshTokenCommandHandler,
    RegisterCommandHandler,
    ValidateTokenCommandHandler,
];

const eventHandlers = [UserUpdatedEventHandler];

const strategies = [JwtStrategy];

const events = [TokenRefreshedEvent, UserRegisteredEvent, UserUpdatedEvent, UserUpdatedMappedEvent];

@Module({
    imports: [
        CqrsModule.forRoot(),
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
            inject: [AuthConfigService],
            useFactory: (configService: AuthConfigService) => ({
                host: configService.postgresHost,
                port: configService.postgresPort,
                user: configService.postgresUser,
                password: configService.postgresPassword,
                database: configService.postgresDB,
            }),
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
        ...commandHandlers,
        ...strategies,
        ...eventHandlers,
        {
            provide: "EVENTS",
            useValue: events,
        },
        UsersRepository,
        AuthConfigService,
        ConfigService,
        RabbitMQPublisher,
        RabbitMQSubscriber,
    ],
    exports: [...commandHandlers, UsersRepository, CqrsModule],
})
export class AuthModule implements OnModuleInit {
    constructor(
        private readonly event$: EventBus,
        private readonly rbmqPublisher: RabbitMQPublisher,
        private readonly rbmqSubscriber: RabbitMQSubscriber,
    ) {}

    async onModuleInit() {
        await this.rbmqSubscriber.connect();
        this.rbmqSubscriber.bridgeEventsTo(this.event$.subject$);

        this.rbmqPublisher.connect();
        this.event$.publisher = this.rbmqPublisher;
    }
}
