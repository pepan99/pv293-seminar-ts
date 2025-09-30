import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/zod-dtos';
import { randomUUID } from 'node:crypto';

@Injectable()
export class InMemoryAccountsRepository {
  private accounts: Account[] = [];

  async findAll(): Promise<Account[]> {
    return this.accounts;
  }
  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const newAccount: Account = {
      ...createAccountDto,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.push(newAccount);
    return newAccount;
  }
  async findAllByUserId(userId: string): Promise<Account[]> {
    return this.accounts.filter((account) => account.userId === userId);
  }
}
