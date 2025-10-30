import { Module } from '@nestjs/common';
import { AccountsController } from './api/controllers/accounts.controller';
import { CreateAccountUseCase } from './application/create-account.use-case';
import { RemoveAccountUseCase } from './application/remove-account.use-case';
import { UpdateAccountUseCase } from './application/update-account.use-case';
import { GetAccountBalanceUseCase } from './application/get-account-balance.use-case';
import { FindAccoutByIdUseCase } from './application/find-account-by-id.use-case';
import { FindAllAccountsUseCase } from './application/find-all-accounts.use-case';
import { AuthModule } from '../auth/auth.module';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';

const useCases = [
  CreateAccountUseCase,
  RemoveAccountUseCase,
  UpdateAccountUseCase,
  GetAccountBalanceUseCase,
  FindAccoutByIdUseCase,
  FindAllAccountsUseCase,
];

@Module({
  imports: [AuthModule],
  controllers: [AccountsController],
  providers: [AccountsRepository, ...useCases],
  exports: [
    AccountsRepository,
    CreateAccountUseCase,
    FindAccoutByIdUseCase,
    FindAllAccountsUseCase,
  ],
})
export class AccountsModule {}
