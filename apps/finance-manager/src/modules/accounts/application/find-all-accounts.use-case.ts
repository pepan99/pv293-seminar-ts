import { Injectable } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class FindAllAccountsUseCase {
  constructor(private accountsRepository: AccountsRepository) {}
  async execute(userId: string): Promise<Account[]> {
    return this.accountsRepository.findAll(userId);
  }
}
