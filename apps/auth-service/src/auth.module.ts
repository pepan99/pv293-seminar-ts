import { Module, OnModuleInit } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./api/controllers/auth.controller";
import { AuthMessageController } from "./api/controllers/auth.message.controller";
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
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import {
  DatabaseModule,
  RabbitMQPublisher,
  RabbitMQSubscriber,
  UserUpdatedEvent,
} from "shared-kernel";
import { AuthConfigModule } from "./infrastructure/config/auth-config.module";
import { AuthConfigService } from "./infrastructure/config/auth-config.service";
import { UserUpdatedMappedEventHandler } from "./application/events/users-updated.handler";
import { AppConfigModule } from "shared-kernel/src";

const commandHandlers = [
  LoginCommandHandler,
  RefreshTokenCommandHandler,
  RegisterCommandHandler,
  ValidateTokenCommandHandler,
];

const eventHandlers = [UserUpdatedEventHandler, UserUpdatedMappedEventHandler];

const strategies = [JwtStrategy];

const events = [
  TokenRefreshedEvent,
  UserRegisteredEvent,
  UserUpdatedEvent,
  UserUpdatedMappedEvent,
];

@Module({
  imports: [
    CqrsModule.forRoot(),
    AuthConfigModule,
    AppConfigModule,
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
  controllers: [AuthController, AuthMessageController],
  providers: [
    ...commandHandlers,
    ...strategies,
    ...eventHandlers,
    {
      provide: "EVENTS",
      useValue: events,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
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
