import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { UsersController } from "./api/controllers/users.controller";
import { UsersMessageController } from "./api/controllers/users.message.controller";
import { CreateUserCommandHandler } from "./application/commands/create-user.handler";
import { UpdateUserCommandHandler } from "./application/commands/update-user.handler";
import { UpdateUserAdminCommandHandler } from "./application/commands/update-user-admin.handler";
import { RemoveUserCommandHandler } from "./application/commands/remove-user.handler";
import { ChangePasswordCommandHandler } from "./application/commands/change-password.handler";
import { GetAllUsersQueryHandler } from "./application/queries/get-all-users.handler";
import { GetUserByIdQueryHandler } from "./application/queries/get-user-by-id.handler";
import { GetUserByEmailQueryHandler } from "./application/queries/get-user-by-email.handler";
import { ConfigService } from "@nestjs/config";
import { UsersRepository } from "./infrastructure/database/repositories/users.repository";
import { UserAggregateRepository } from "./infrastructure/database/repositories/users-aggregate.repository";
import { UserConfigModule } from "./infrastructure/config/user-config.module";
import { UserConfigService } from "./infrastructure/config/user-config.service";
import { UserCreatedEvent } from "./core/events/user-created.event";
import { UserDeactivatedEvent } from "./core/events/user-deactivated.event";
import { UserPasswordChangedEvent } from "./core/events/user-password-changed.event";
import { UserRemovedEvent } from "./core/events/user-removed.event";
import { UserRolesChangedEvent } from "./core/events/user-roles-changed.event";
import { UserUpdatedEvent } from "./core/events/user-updated.event";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import {
  UserRegisteredEventHandler,
  UserRegisteredMappedEvent,
} from "./infrastructure/anti-corruption-layer/user-registered.mapper";
import { UserRegisteredMappedEventHandler } from "./application/events/user-registered.handler";
import {
  DatabaseModule,
  RabbitMQPublisher,
  RabbitMQSubscriber,
  UserRegisteredEvent,
} from "shared-kernel";
import { AppConfigModule } from "shared-kernel/src";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";

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

const eventHandlers = [
  UserRegisteredMappedEventHandler,
  UserRegisteredEventHandler,
];

const events = [
  UserCreatedEvent,
  UserDeactivatedEvent,
  UserRegisteredEvent,
  UserRegisteredMappedEvent,
  UserPasswordChangedEvent,
  UserRemovedEvent,
  UserRolesChangedEvent,
  UserUpdatedEvent,
];

@Module({
  imports: [
    CqrsModule.forRoot(),
    UserConfigModule,
    AppConfigModule,
    DatabaseModule.forFeatureAsync({
      imports: [UserConfigModule],
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) => {
        console.log(configService.postgresDB);
        return {
          host: configService.postgresHost,
          port: configService.postgresPort,
          user: configService.postgresUser,
          password: configService.postgresPassword,
          database: configService.postgresDB,
        };
      },
    }),
    RabbitMQModule.forRootAsync({
      imports: [UserConfigModule],
      inject: [UserConfigService],
      useFactory: (configService: UserConfigService) => {
        return {
          uri: configService.rabbitmqUri,
          connectionInitOptions: { wait: false },
        };
      },
    }),
  ],
  controllers: [UsersController, UsersMessageController],
  providers: [
    UsersRepository,
    UserAggregateRepository,
    UserConfigService,
    ConfigService,
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
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
  exports: [
    UsersRepository,
    UserAggregateRepository,
    GetUserByIdQueryHandler,
    GetUserByEmailQueryHandler,
  ],
})
export class UsersModule implements OnModuleInit {
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
