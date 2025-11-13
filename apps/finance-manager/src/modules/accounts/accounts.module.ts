import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './api/controllers/accounts.controller';
import { AccountAggregateRepository } from './infrastructure/repositories/account-aggregate.repository';
import { CreateAccountCommandHandler } from './application/commands/create-account.handler';
import { RemoveAccountCommandHandler } from './application/commands/remove-account.handler';
import { UpdateAccountCommandHandler } from './application/commands/update-account.handler';
import { GetAccountBalanceQueryHandler } from './application/queries/get-account-balance.handler';
import { GetAccountByIdQueryHandler } from './application/queries/get-account-by-id.handler';
import { GetTotalBalanceQueryHandler } from './application/queries/get-total-balance.handler';
import { GetAllAccountsQueryHandler } from './application/queries/get-all-accounts.handler';
import { IAccountsRepository } from './core/repositories/accounts-repository.interface';

const commandHandlers = [
  CreateAccountCommandHandler,
  RemoveAccountCommandHandler,
  UpdateAccountCommandHandler,
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
      provide: 'IAccountAggregateRepository',
      useClass: AccountAggregateRepository,
    },
    {
      provide: 'IAccountsRepository',
      useClass: AccountAggregateRepository, //TODO: Remove
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AccountsModule {}
