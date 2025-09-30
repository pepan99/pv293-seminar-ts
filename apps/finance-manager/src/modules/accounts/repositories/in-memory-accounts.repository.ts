import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/zod-dtos';
import { randomUUID } from 'node:crypto';

@Injectable()
export class InMemoryAccountsRepository {
  private accounts: Account[] = [];

  async findAll(): Promise<Account[]> {
    return Promise.resolve(this.accounts);
  }
  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const newAccount: Account = {
      ...createAccountDto,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.push(newAccount);
    return Promise.resolve(newAccount);
  }
  async findAllByUserId(userId: string): Promise<Account[]> {
    return Promise.resolve(
      this.accounts.filter((account) => account.userId === userId),
    );
  }
}
