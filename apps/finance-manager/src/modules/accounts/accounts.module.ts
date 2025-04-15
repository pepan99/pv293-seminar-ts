import { Module } from "@nestjs/common";
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
import { ConfigService } from "@nestjs/config";

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
        AccountConfigService,
        ConfigService,
        {
            provide: "EVENTS",
            useValue: events,
        },
        ...queryHandlers,
    ],
})
export class AccountsModule {}
