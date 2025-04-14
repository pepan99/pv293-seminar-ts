import { Module, OnModuleInit } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./api/controllers/auth.controller";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { LoginCommandHandler } from "./application/commands/login.handler";
import { RefreshTokenCommandHandler } from "./application/commands/refresh-token.handler";
import { RegisterCommandHandler } from "./application/commands/register.handler";
import { ValidateTokenCommandHandler } from "./application/commands/validate-token.handler";
import { UsersRepository } from "./infrastructure/database/repositories/users.repository";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import {
    UserUpdatedEventHandler,
    UserUpdatedMappedEvent,
} from "./infrastructure/anti-corruption-layer/user-edited.mapper";
import { TokenRefreshedEvent } from "./core/events/token-refreshed.event";
import { UserRegisteredEvent } from "./core/events/user-registered.event";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { DatabaseModule, DbEnv, defaultEnvSchema, EnvModule, EnvService, RabbitmqEnv, RabbitMQPublisher, RabbitMQSubscriber } from "shared-kernel/src";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";

const commandHandlers = [
    LoginCommandHandler,
    RefreshTokenCommandHandler,
    RegisterCommandHandler,
    ValidateTokenCommandHandler,
];

const eventHandlers = [UserUpdatedEventHandler];

const strategies = [JwtStrategy];

const events = [TokenRefreshedEvent, UserRegisteredEvent, UserUpdatedMappedEvent];


@Module({
    imports: [
        CqrsModule,
        ConfigModule.forRoot({
            validate: (config) => {
                const result = defaultEnvSchema.safeParse(config);
                if (!result.success) {
                    console.error(result.error)
                    throw new Error(`Config validation error`);
                }
                return result.data;
            },
        }),
        EnvModule,
        RabbitMQModule.forRootAsync({
            imports: [EnvModule],
            inject: [EnvService],
            useFactory: (envService: EnvService<RabbitmqEnv>) => {
                return {
                    uri: envService.get("RABBITMQ_URI"),
                    connectionInitOptions: { wait: false },
                };
            },
        }),
        DatabaseModule.forRootAsync({
            imports: [EnvModule],
            inject: [EnvService],
            useFactory: (envService: EnvService<DbEnv>) => {
                return {
                    host: envService.get("POSTGRES_HOST"),
                    port: envService.get("POSTGRES_PORT"),
                    user: envService.get("POSTGRES_USER"),
                    password: envService.get("POSTGRES_PASSWORD"),
                    database: envService.get("POSTGRES_DB"),
                };
            },
        }),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: {
                    expiresIn: "1h",
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        ...commandHandlers,
        ...eventHandlers,
        ...strategies,
        UsersRepository,
        {
            provide: "EVENTS",
            useValue: events,
        },
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        RabbitMQPublisher,
        RabbitMQSubscriber,
    ],
    exports: [...commandHandlers, UsersRepository],
})
export class AuthModule implements OnModuleInit {
    constructor(
        private readonly event$: EventBus,
        private readonly rbmqPublisher: RabbitMQPublisher,
        private readonly rbmqSubscriber: RabbitMQSubscriber,
    ) { }

    async onModuleInit() {
        await this.rbmqSubscriber.connect();
        this.rbmqSubscriber.bridgeEventsTo(this.event$.subject$);

        this.rbmqPublisher.connect();
        this.event$.publisher = this.rbmqPublisher;
    }
}
