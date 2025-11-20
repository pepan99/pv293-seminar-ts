import { Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { AccountsController } from "./api/controllers/accounts.controller";
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
import { AccountConfigService } from "./infrastructure/config/account-config.service";
import { AccountConfigModule } from "./infrastructure/config/account-config.module";
import { DatabaseModule } from "../shared-kernel/infrastructure/database/database.module";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { RabbitMQPublisher } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq-publisher";

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

@Module({
    imports: [
        CqrsModule,
        AccountConfigModule,
        RabbitMQModule.forRootAsync({
            imports: [AccountConfigModule],
            inject: [AccountConfigService],
            useFactory: (configService: AccountConfigService) => ({
                uri: configService.rabbitmqUri,
                connectionInitOptions: { wait: false },
            }),
        }),
        DatabaseModule.forFeatureAsync({
            imports: [AccountConfigModule],
            injects: [AccountConfigService],
            // @ts-ignore
            useFactory: (configService: AccountConfigService) => ({
                host: configService.postgresHost,
                port: configService.postgresPort,
                user: configService.postgresUser,
                password: configService.postgresPassword,
                database: configService.postgresDB,
            }),
            inject: [AccountConfigService],
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
        ...queryHandlers,
        RabbitMQPublisher,
    ],
})
export class AccountsModule implements OnModuleInit {
    constructor(
        private readonly event$: EventBus,
        private readonly rbmqPublisher: RabbitMQPublisher,
    ) {}

    async onModuleInit() {
        // Connect RabbitMQ publisher and set as event bus publisher
        this.rbmqPublisher.connect();
        this.event$.publisher = this.rbmqPublisher;

        console.log("[Accounts Module] RabbitMQ connected successfully");
    }
}
