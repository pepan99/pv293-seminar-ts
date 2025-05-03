import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './api/controllers/accounts.controller';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';
import { CreateAccountUseCase } from './application/create-account.use-case';
import { RemoveAccountUseCase } from './application/remove-account.use-case';
import { UpdateAccountUseCase } from './application/update-account-use-case';
import { GetAccountBalanceUseCase } from './application/get-account-balance.use-case';
import { FindOneAccountUseCase } from './application/find-one-account.use-case';
import { GetTotalBalanceUseCase } from './application/get-total-balance.use-case';
import { FindAllAccountsUseCase } from './application/find-all-accounts.use-case';

const useCases = [
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
    ...useCases,
  ],
  exports: ['IAccountsRepository', ...useCases],
})
export class AccountsModule {}
