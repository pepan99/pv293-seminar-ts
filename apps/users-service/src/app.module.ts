import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import {
  DatabaseModule,
  RabbitMQPublisher,
  RabbitMQSubscriber,
} from "shared-kernel";

import { UsersConfigModule } from "./config/config.module";
import { UsersConfigService } from "./config/users.config";
import { UsersRpcHandler } from "./rpc/users-rpc.handler";

import { UsersRepository } from "./infrastructure/database/repositories/users.repository";
import { UserAggregateRepository } from "./infrastructure/database/repositories/users-aggregate.repository";

import { CreateUserCommandHandler } from "./application/commands/create-user.handler";
import { UpdateUserCommandHandler } from "./application/commands/update-user.handler";
import { UpdateUserAdminCommandHandler } from "./application/commands/update-user-admin.handler";
import { ChangePasswordCommandHandler } from "./application/commands/change-password.handler";
import { RemoveUserCommandHandler } from "./application/commands/remove-user.handler";

import { GetUserByIdQueryHandler } from "./application/queries/get-user-by-id.handler";
import { GetAllUsersQueryHandler } from "./application/queries/get-all-users.handler";

import { UserCreatedEvent } from "./core/events/user-created.event";
import { UserUpdatedEvent } from "./core/events/user-updated.event";
import { UserRemovedEvent } from "./core/events/user-removed.event";
import { UserRolesChangedEvent } from "./core/events/user-roles-changed.event";
import { UserPasswordChangedEvent } from "./core/events/user-password-changed.event";

const commandHandlers = [
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  UpdateUserAdminCommandHandler,
  ChangePasswordCommandHandler,
  RemoveUserCommandHandler,
];

const queryHandlers = [GetUserByIdQueryHandler, GetAllUsersQueryHandler];

const events = [
  UserCreatedEvent,
  UserUpdatedEvent,
  UserRemovedEvent,
  UserRolesChangedEvent,
  UserPasswordChangedEvent,
];

@Module({
  imports: [
    CqrsModule.forRoot(),
    UsersConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [UsersConfigModule],
      inject: [UsersConfigService],
      useFactory: (config: UsersConfigService) => ({
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
      imports: [UsersConfigModule],
      inject: [UsersConfigService],
      useFactory: (config: UsersConfigService) => ({
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
    ...queryHandlers,
    UsersRpcHandler,
    {
      provide: "IUsersRepository",
      useClass: UsersRepository,
    },
    {
      provide: "IUsersAggregateRepository",
      useClass: UserAggregateRepository,
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
