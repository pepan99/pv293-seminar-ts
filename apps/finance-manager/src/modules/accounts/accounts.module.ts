import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './api/controllers/accounts.controller';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';
import { CreateAccountCommandHandler } from './application/commands/create-account-command.handler';
import { RemoveAccountCommandHandler } from './application/commands/remove-account-commander.handler';
import { UpdateAccountCommandHandler } from './application/commands/update-account-command.handler';
import { GetAccountBalanceQueryHandler } from './application/queries/get-account-balance-query.handler';
import { GetTotalBalanceQueryHandler } from './application/queries/get-total-balance-query.handler';
import { GetAllAccountsByUserIdQueryHandler } from './application/queries/get-all-account-by-id-query.handler';
import { GetAccountByIdQueryHandler } from './application/queries/get-account-by-id-query.handler';

const commandHandlers = [
  CreateAccountCommandHandler,
  RemoveAccountCommandHandler,
  UpdateAccountCommandHandler,
];
const queryHandlers = [
  GetAccountBalanceQueryHandler,
  GetAccountByIdQueryHandler,
  GetAllAccountsByUserIdQueryHandler,
  GetTotalBalanceQueryHandler,
];

@Module({
  imports: [AuthModule],
  controllers: [AccountsController],
  providers: [
    {
      provide: 'IAccountsRepository',
      useClass: AccountsRepository,
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: ['IAccountsRepository', ...commandHandlers, ...queryHandlers],
})
export class AccountsModule {}
