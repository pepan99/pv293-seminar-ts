import { Injectable, NotFoundException } from '@nestjs/common';
import { Accounts } from './entities/accounts.entity';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AccountsService {
  constructor() {}

  private accounts: Accounts[] = [
    {
      id: '1',
      ownerId: 'user-1',
      name: 'Checking Account',
      type: 'checking',
      balance: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      ownerId: 'user-1',
      name: 'Savings Account',
      type: 'savings',
      balance: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      ownerId: 'user-2',
      name: 'Business Account',
      type: 'business',
      balance: 20000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): Promise<Accounts[]> {
    return Promise.resolve(this.accounts);
  }

  async findOne(id: string): Promise<Accounts | undefined> {
    return Promise.resolve(this.accounts.find((account) => account.id === id));
  }

  async findByOwnerId(ownerId: string): Promise<Accounts[]> {
    const user = this.accounts.find((account) => account.ownerId === ownerId);
    if (!user) {
      throw new NotFoundException(`User with id ${ownerId} not found`);
    }
    return Promise.resolve(
      this.accounts.filter((account) => account.ownerId === ownerId),
    );
  }

  async create(
    createAccountDto: Omit<Accounts, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Accounts> {
    const newAccount: Accounts = {
      id: randomUUID(),
      ...createAccountDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.push(newAccount);
    return Promise.resolve(newAccount);
  }

  async update(
    id: string,
    updateAccountDto: Partial<Accounts>,
  ): Promise<Accounts | undefined> {
    const account = await this.findOne(id);
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    Object.assign(account, updateAccountDto);
    return Promise.resolve(account);
  }

  async remove(id: string): Promise<void> {
    const accountIndex = this.accounts.findIndex(
      (account) => account.id === id,
    );
    if (accountIndex === -1) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    this.accounts.splice(accountIndex, 1);
    return Promise.resolve();
  }
}
