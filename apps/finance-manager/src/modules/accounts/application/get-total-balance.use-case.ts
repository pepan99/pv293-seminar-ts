import { Injectable } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class GetTotalBalanceUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(userId: string) {
    return this.accountsRepository.getBalanceForAllUserAccounts(userId);
  }
}
