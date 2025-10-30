import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountsRepository } from './infrastructure/repositories/accounts.repository';
import { AccountsController } from './api/controllers/accounts.controller';
import { CreateUserAccountUseCase } from './application/create-user-account.use-case';
import { GetUserAccountBalanceUseCase } from './application/get-user-account-ballance.use-case';
import { GetAllUserAccountsBalancesUseCase } from './application/get-all-user-accounts-ballances.use-case';
import { FindUserAccountByIdUseCase } from './application/find-user-account-by-id.use-case';
import { FindAllUserAccountsUseCase } from './application/find-all-user-accounts.use-case';
import { UpdateUserAccountUseCase } from './application/update-user-account.use-case';
import { RemoveUserAccountUseCase } from './application/remove-user-account.use-case';

@Module({
  imports: [AuthModule],
  controllers: [AccountsController],
  providers: [
    CreateUserAccountUseCase,
    GetUserAccountBalanceUseCase,
    GetAllUserAccountsBalancesUseCase,
    FindUserAccountByIdUseCase,
    FindAllUserAccountsUseCase,
    UpdateUserAccountUseCase,
    RemoveUserAccountUseCase,
    AccountsRepository,
  ],
  exports: [
    CreateUserAccountUseCase,
    GetUserAccountBalanceUseCase,
    GetAllUserAccountsBalancesUseCase,
    FindUserAccountByIdUseCase,
    FindAllUserAccountsUseCase,
    UpdateUserAccountUseCase,
    RemoveUserAccountUseCase,
  ],
})
export class AccountsModule {}
