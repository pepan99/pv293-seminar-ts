import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { AccountsController } from "./api/controllers/accounts.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { AccountsRepository } from "./infrastructure/database/repositories/accounts.repository";
import { AccountAggregateRepository } from "./infrastructure/database/repositories/accounts-aggregate.repository";

import { CreateAccountCommandHandler } from "./application/commands/create-account.handler";
import { RemoveAccountCommandHandler } from "./application/commands/remove-account.handler";
import { UpdateAccountCommandHandler } from "./application/commands/update-account.handler";
import { GetAccountBalanceQueryHandler } from "./application/queries/get-account-balance.handler";
import { GetAccountByIdQueryHandler } from "./application/queries/get-account-by-id.handler";
import { GetTotalBalanceQueryHandler } from "./application/queries/get-total-balance.handler";
import { GetAllAccountsQueryHandler } from "./application/queries/get-all-accounts.handler";
import { ReconcileAccountCommandHandler } from "./application/commands/reconcile-account.handler";
import { DatabaseModule } from "../shared-kernel/infrastructure/database/database.module";
import { AccountConfigService } from "./infrastructure/config/account-config.service";
import { AccountConfigModule } from "./infrastructure/config/account-config.module";
import { AccountCreatedEvent } from "./core/events/account-created.event";
import { AccountRemovedEvent } from "./core/events/account-removed.event";
import { AccountUpdatedEvent } from "./core/events/account-updated.event";
import { AccountReconciledEvent } from "./core/events/account-reconciled.event";
import { AuthConfigModule } from "../auth/infrastructure/config/auth-config.module";
import { AuthConfigService } from "../auth/infrastructure/config/auth-config.service";
import { AccountConfigModule } from "./infrastructure/config/account-config.module";
import { AccountConfigService } from "./infrastructure/config/account-config.service";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { RabbitMQPublisher } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-publisher";
import { RabbitMQSubscriber } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-subscriber";

const commandHandlers = [
    CreateAccountCommandHandler,
    RemoveAccountCommandHandler,
    UpdateAccountCommandHandler,
    ReconcileAccountCommandHandler,
];

const queryHandlers = [
    GetAccountBalanceQueryHandler,
    GetAccountByIdQueryHandler,
    GetTotalBalanceQueryHandler,
    GetAllAccountsQueryHandler,
];

const events = [
    AccountCreatedEvent,
    AccountRemovedEvent,
    AccountUpdatedEvent,
    AccountReconciledEvent,
];

@Module({
    imports: [
        CqrsModule,
        AccountConfigModule,
        RabbitMQModule.forRootAsync({
            imports: [AccountConfigModule],
            inject: [AccountConfigService],
            useFactory: (configService: AccountConfigService) => {
                return {
                    uri: configService.rabbitmqUri,
                    connectionInitOptions: { wait: false },
                };
            },
        }),
        DatabaseModule.forFeatureAsync({
            imports: [AccountConfigModule],
            inject: [AccountConfigService],
            useFactory: (configService: AccountConfigService) => {
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
    ],
    controllers: [AccountsController],
    providers: [
        {
            provide: "IAccountsRepository",
            useClass: AccountsRepository,
        },
        {
            provide: "IAccountsAggregateRepository",
            useClass: AccountAggregateRepository,
        },
        ...commandHandlers,
        AccountConfigService,
        ConfigService,
        ...commandHandlers,
        ...queryHandlers,
        RabbitMQPublisher,
        RabbitMQSubscriber,
        {
            provide: "EVENTS",
            useValue: events,
        },
        ...queryHandlers,
    ],
})
export class AccountsModule implements OnModuleInit {
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
