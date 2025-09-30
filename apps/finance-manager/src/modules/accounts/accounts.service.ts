import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/zod-dtos';
import { Account } from './entities/account.entity';
import { InMemoryAccountsRepository } from './repositories/in-memory-accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: InMemoryAccountsRepository) {}
  findAll(): Promise<Account[]> {
    const accounts = this.accountsRepository.findAll();
    return accounts;
  }
  create(account: CreateAccountDto): Promise<Account> {
    return this.accountsRepository.create(account);
  }

  findAllByUserId(userId: string): Promise<Account[]> {
    return this.accountsRepository.findAllByUserId(userId);
  }
}
