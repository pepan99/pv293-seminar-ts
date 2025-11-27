import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import {
  DatabaseModule,
  RabbitMQPublisher,
  RabbitMQSubscriber,
} from "shared-kernel";

import { AccountsConfigModule } from "./config/config.module";
import { AccountsConfigService } from "./config/accounts.config";
import { AccountsRpcHandler } from "./rpc/accounts-rpc.handler";

import { AccountsRepository } from "./infrastructure/database/repositories/accounts.repository";

import { CreateAccountCommandHandler } from "./application/commands/create-account.handler";
import { UpdateAccountCommandHandler } from "./application/commands/update-account.handler";
import { RemoveAccountCommandHandler } from "./application/commands/remove-account.handler";

import { GetAccountByIdQueryHandler } from "./application/queries/get-account-by-id.handler";
import { GetAllAccountsQueryHandler } from "./application/queries/get-all-accounts.handler";
import { GetAccountBalanceQueryHandler } from "./application/queries/get-account-balance.handler";
import { GetTotalBalanceQueryHandler } from "./application/queries/get-total-balance.handler";

import { AccountCreatedEvent } from "./core/events/account-created.event";
import { AccountUpdatedEvent } from "./core/events/account-updated.event";
import { AccountRemovedEvent } from "./core/events/account-removed.event";

const commandHandlers = [
  CreateAccountCommandHandler,
  UpdateAccountCommandHandler,
  RemoveAccountCommandHandler,
];

const queryHandlers = [
  GetAccountByIdQueryHandler,
  GetAllAccountsQueryHandler,
  GetAccountBalanceQueryHandler,
  GetTotalBalanceQueryHandler,
];

const events = [AccountCreatedEvent, AccountUpdatedEvent, AccountRemovedEvent];

@Module({
  imports: [
    CqrsModule.forRoot(),
    AccountsConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [AccountsConfigModule],
      inject: [AccountsConfigService],
      useFactory: (config: AccountsConfigService) => ({
        uri: config.rabbitmqUri,
        connectionInitOptions: { wait: true, timeout: 30000 },
        enableControllerDiscovery: true,
      }),
    }),
    DatabaseModule.forFeatureAsync({
      imports: [AccountsConfigModule],
      inject: [AccountsConfigService],
      useFactory: (config: AccountsConfigService) => ({
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
    AccountsRpcHandler,
    {
      provide: "IAccountsRepository",
      useClass: AccountsRepository,
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
