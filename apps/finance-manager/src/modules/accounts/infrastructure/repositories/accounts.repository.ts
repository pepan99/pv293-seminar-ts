import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '../../../../shared-kernel/infrastructure/database/database';
import { Account } from '../../core/types/types';

import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { CreateAccountCommand } from '../../application/commands/create-account-command.handler';
import { UpdateAccountCommand } from '../../application/commands/update-account-command.handler';

@Injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(private readonly db: Database) {}

  async create(
    command: CreateAccountCommand,
    userId: string,
  ): Promise<Account> {
    const id = crypto.randomUUID();

    const account = await this.db
      .insertInto('accounts')
      .values({
        id,
        ...command,
        isActive: true,
        lastReconciled: new Date(),
        initialBalance: 0,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    if (!account) throw Error('Unable to create account');

    return account;
  }

  async findOne(id: string, userId: string): Promise<Account | undefined> {
    const account = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return account;
  }

  async findAll(userId: string): Promise<Account[]> {
    return await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('userId', '=', userId)
      .execute();
  }

  async update(
    id: string,
    command: UpdateAccountCommand,
    userId: string,
  ): Promise<Account | undefined> {
    const account = await this.findOne(id, userId);
    if (!account) {
      return undefined;
    }

    return await this.db
      .updateTable('accounts')
      .set({
        ...command,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirst();
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const account = await this.findOne(id, userId);
    if (!account) {
      return false;
    }

    const result = await this.db
      .deleteFrom('accounts')
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return !!result;
  }

  async getBalance(id: string, userId: string): Promise<number> {
    const account = await this.findOne(id, userId);

    if (!account)
      throw new NotFoundException(`Account with id: ${id} not found.`);

    return Number(account.initialBalance);
  }

  async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.findAll(userId);
    return accounts.reduce(
      (total, account) => total + Number(account.initialBalance),
      0,
    );
  }
}
