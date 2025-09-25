import { Injectable } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AccountsService {
  private accounts: Map<string, Account> = new Map();

  constructor() {
    const firstId = randomUUID();
    const secondId = randomUUID();

    // Initialize with some mock data
    this.accounts.set(firstId, {
      id: firstId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2024-01-01'),
      deletedAt: null,
    });
    this.accounts.set(secondId, {
      id: secondId,
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date('2024-01-02'),
      deletedAt: null,
    });
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async findById(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async create(
    account: Omit<Account, 'id' | 'createdAt' | 'deletedAt'>,
  ): Promise<Account> {
    const newAccount: Account = {
      ...account,
      id: randomUUID(),
      createdAt: new Date(),
      deletedAt: null,
    };
    this.accounts.set(newAccount.id, newAccount);
    return newAccount;
  }

  async update(
    id: string,
    updates: Partial<Omit<Account, 'id'>>,
  ): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) {
      return undefined;
    }
    const updatedAccount = { ...account, ...updates };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async delete(id: string): Promise<boolean> {
    const account = this.accounts.get(id);
    if (!account) {
      return false;
    }
    account.deletedAt = new Date();
    this.accounts.set(id, account);
    return true;
  }
}
