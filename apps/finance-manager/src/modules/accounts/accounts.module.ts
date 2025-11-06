import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './api/controllers/accounts.controller';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';
import { CreateAccountUseCase } from './application/commands/create-account.handler';
import { RemoveAccountUseCase } from './application/remove-account.use-case';
import { UpdateAccountUseCase } from './application/update-account-use-case';
import { GetAccountBalanceUseCase } from './application/queries/get-account-balance.use-case';
import { FindOneAccountUseCase } from './application/queries/find-one-account.handler';
import { GetTotalBalanceUseCase } from './application/get-total-balance.use-case';
import { FindAllAccountsUseCase } from './application/queries/find-all-accounts.handler';

const commandHandlers = [
  CreateAccountUseCase,
  RemoveAccountUseCase,
  UpdateAccountUseCase,
  GetAccountBalanceUseCase,
  FindOneAccountUseCase,
  FindAllAccountsUseCase,
  GetTotalBalanceUseCase,
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
  ],
  exports: ['IAccountsRepository', ...commandHandlers],
})
export class AccountsModule {}
