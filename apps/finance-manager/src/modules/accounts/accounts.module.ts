import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './api/controllers/accounts.controller';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';
import { CreateAccountCommandHandler } from './application/commands/create-account.handler';
import { UpdateAccountCommandHandler } from './application/commands/update-account.handler';
import { RemoveAccountCommandHandler } from './application/commands/remove-account.handler';
import { FindAllAccountsQueryHandler } from './application/queries/find-all-accounts.handler';
import { FindOneAccountQueryHandler } from './application/queries/find-one-account.handler';
import { GetAccountBalanceQueryHandler } from './application/queries/get-account-balance.handler';
import { GetTotalBalanceQueryHandler } from './application/queries/get-total-balance.handler';

const commandHandlers = [
  CreateAccountCommandHandler,
  UpdateAccountCommandHandler,
  RemoveAccountCommandHandler,
];

const queryHandlers = [
  FindAllAccountsQueryHandler,
  FindOneAccountQueryHandler,
  GetAccountBalanceQueryHandler,
  GetTotalBalanceQueryHandler,
];

@Module({
  imports: [AuthModule, CqrsModule],
  controllers: [AccountsController],
  providers: [
    {
      provide: 'IAccountsRepository',
      useClass: AccountsRepository,
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: ['IAccountsRepository'],
})
export class AccountsModule { }
