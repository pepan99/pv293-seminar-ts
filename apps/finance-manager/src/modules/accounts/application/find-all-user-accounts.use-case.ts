import { Injectable } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';
import { Account } from '../core/entities/accounts.entity';

@Injectable()
export class FindAllUserAccountsUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}
  async execute(userId: string): Promise<Account[]> {
    return this.accountsRepository.findAll(userId);
  }
}
