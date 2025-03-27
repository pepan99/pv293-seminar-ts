import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from './entities/accounts.entity';
import { CreateAccountDto, UpdateAccountDto } from './dtos/accounts-zod.dtos';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AccountsService {
  private accounts: Map<string, Account> = new Map();

  constructor() {}

  create(createAccountDto: CreateAccountDto, userId: string) {
    const id = randomUUID();

    const newAccount: Account = {
      ...createAccountDto,
      description: createAccountDto.description || '',
      id,
      currency: createAccountDto.currency || 'EUR',
      isActive: true,
      icon: createAccountDto.icon || '',
      color: createAccountDto.color || 'blue',
      lastReconciled: new Date(),
      initialBalance: 0,
      transactionIds: [],
      updatedAt: new Date(),
      createdAt: new Date(),
      userId,
    };

    this.accounts.set(id, newAccount);

    return newAccount;
  }

  findAll(userId: string) {
    const userAccounts = Array.from(this.accounts.values())
      .filter((account) => account.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));

    return userAccounts;
  }

  findOne(id: string, userId: string) {
    const account = this.accounts.get(id);

    if (!account || account.userId !== userId) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  update(id: string, updateAccountDto: UpdateAccountDto, userId: string) {
    const account = this.findOne(id, userId);

    const updatedAccount: Account = {
      ...account,
      ...updateAccountDto,
      updatedAt: new Date(),
    };

    this.accounts.set(id, updatedAccount);

    return updatedAccount;
  }

  remove(id: string, userId: string) {
    this.findOne(id, userId);

    this.accounts.delete(id);
  }

  getAccountBalance(id: string, userId: string) {
    const account = this.findOne(id, userId);

    // get initial balance for now
    return { balance: account.initialBalance };
  }
}
