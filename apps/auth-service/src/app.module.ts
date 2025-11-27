import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import {
  DatabaseModule,
  RabbitMQPublisher,
  RabbitMQSubscriber,
} from "shared-kernel";

import { AuthConfigModule } from "./config/config.module";
import { AuthConfigService } from "./config/auth.config";
import { AuthRpcHandler } from "./rpc/auth-rpc.handler";

import { UsersRepository } from "./infrastructure/database/repositories/users.repository";

import { RegisterCommandHandler } from "./application/commands/register.handler";
import { LoginCommandHandler } from "./application/commands/login.handler";
import { RefreshTokenCommandHandler } from "./application/commands/refresh-token.handler";
import { ValidateTokenCommandHandler } from "./application/commands/validate-token.handler";

import { UserUpdatedEventHandler } from "./application/events/user-updated.handler";
import { UserEventsSubscriber } from "./infrastructure/anti-corruption-layer/user-events.subscriber";

import { UserRegisteredEvent } from "./core/events/user-registered.event";
import { TokenRefreshedEvent } from "./core/events/token-refreshed.event";
import { UserLoggedInEvent } from "./core/events/user-logged-in.event";

const commandHandlers = [
  RegisterCommandHandler,
  LoginCommandHandler,
  RefreshTokenCommandHandler,
  ValidateTokenCommandHandler,
];

const eventHandlers = [UserUpdatedEventHandler];

const events = [UserRegisteredEvent, TokenRefreshedEvent, UserLoggedInEvent];

@Module({
  imports: [
    CqrsModule.forRoot(),
    AuthConfigModule,
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      inject: [AuthConfigService],
      useFactory: (config: AuthConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: "1h" },
      }),
    }),
    RabbitMQModule.forRootAsync({
      imports: [AuthConfigModule],
      inject: [AuthConfigService],
      useFactory: (config: AuthConfigService) => ({
        uri: config.rabbitmqUri,
        connectionInitOptions: { wait: true, timeout: 30000 },
        enableControllerDiscovery: true,
        exchanges: [
          {
            name: "events_exchange",
            type: "topic",
            options: { durable: true },
          },
        ],
      }),
    }),
    DatabaseModule.forFeatureAsync({
      imports: [AuthConfigModule],
      inject: [AuthConfigService],
      useFactory: (config: AuthConfigService) => ({
        host: config.postgresHost,
        port: config.postgresPort,
        user: config.postgresUser,
        password: config.postgresPassword,
        database: config.postgresDB,
      }),
    }),
  ],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    AuthRpcHandler,
    UserEventsSubscriber,
    {
      provide: "IUsersRepository",
      useClass: UsersRepository,
    },
    {
      provide: "EVENTS",
      useValue: events,
    },
    RabbitMQPublisher,
    RabbitMQSubscriber,
  ],
})
export class AppModule implements OnModuleInit {
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
