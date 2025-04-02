import { Injectable } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class GetAccountBalanceUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(id: string, userId: string): Promise<{ balance: number }> {
    return this.accountsRepository.getAccountBalance(id, userId);
  }
}
