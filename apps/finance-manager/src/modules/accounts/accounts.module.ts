import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './api/controllers/accounts.controller';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';
import { AccountAggregateRepository } from './infrastructure/repositories/accounts-aggregate.repository';

import { CreateAccountCommandHandler } from './application/commands/create-account.handler';
import { RemoveAccountCommandHandler } from './application/commands/remove-account.handler';
import { UpdateAccountCommandHandler } from './application/commands/update-account.handler';
import { GetAccountBalanceQueryHandler } from './application/queries/get-account-balance.handler';
import { GetAccountByIdQueryHandler } from './application/queries/get-account-by-id.handler';
import { GetTotalBalanceQueryHandler } from './application/queries/get-total-balance.handler';
import { GetAllAccountsQueryHandler } from './application/queries/get-all-accounts.handler';
import { ReconcileAccountCommandHandler } from './application/commands/reconcile-account.handler';

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
  imports: [AuthModule, CqrsModule],
  controllers: [AccountsController],
  providers: [
    {
      provide: 'IAccountsRepository',
      useClass: AccountsRepository,
    },
    {
      provide: 'IAccountsAggregateRepository',
      useClass: AccountAggregateRepository,
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AccountsModule {}
