import { Module } from '@nestjs/common';
import { AccountsController } from './api/controllers/accounts.controller';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';
import { GetAccountByIdQueryHandler } from './application/queries/get-account-by-id.handler';
import { GetAllAccountsQueryHandler } from './application/queries/get-all-accounts.handler';
import { GetAccountBalanceQueryHandler } from './application/queries/get-account-balance.ts';
import { GetTotalBalanceQueryHandler } from './application/queries/get-total-balance.ts';
import { UpdateAccountCommandHandler } from './application/commands/update-account.handler';
import { CreateAccountCommandHandler } from './application/commands/create-account.handler';
import { RemoveAccountCommandHandler } from './application/commands/remove-account.handler';
import { CqrsModule } from '@nestjs/cqrs';

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

@Module({
  imports: [CqrsModule],
  controllers: [AccountsController],
  providers: [
    {
      provide: 'IAccountsRepository',
      useClass: AccountsRepository,
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [
    'IAccountsRepository',
    CqrsModule,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AccountsModule {}
