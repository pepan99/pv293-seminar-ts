import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
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
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../shared-kernel/infrastructure/database/database.module";
import {
    DbEnv,
    dbSchema,
    RabbitmqEnv,
} from "../shared-kernel/infrastructure/env-config/env.schema";
import { EnvModule } from "../shared-kernel/infrastructure/env-config/env.module";
import { EnvService } from "../shared-kernel/infrastructure/env-config/env.service";
import { CqrsModule } from "@nestjs/cqrs";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { AccountCreatedEvent } from "./core/events/account-created.event";
import { AccountRemovedEvent } from "./core/events/account-removed.event";
import { AccountUpdatedEvent } from "./core/events/account-updated.event";
import { AccountReconciledEvent } from "./core/events/account-reconciled.event";

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
        AuthModule,
        CqrsModule,
        ConfigModule.forRoot({
            envFilePath: ["./src/modules/accounts/.env"],
            validate: (config) => {
                const result = dbSchema.safeParse(config);
                if (!result.success) {
                    throw new Error(`Config validation error}`);
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
            useFactory: (envService: EnvService<DbEnv>) => ({
                host: envService.get("POSTGRES_HOST"),
                port: envService.get("POSTGRES_PORT"),
                user: envService.get("POSTGRES_USER"),
                password: envService.get("POSTGRES_PASSWORD"),
                database: envService.get("POSTGRES_DB"),
            }),
        }),
    ],
    controllers: [AccountsController],
    providers: [
        AccountsRepository,
        AccountAggregateRepository,
        ...commandHandlers,
        {
            provide: "EVENTS",
            useValue: events,
        },
        ...queryHandlers,
    ],
    exports: [AccountsRepository, AccountAggregateRepository],
})
export class AccountsModule {}
