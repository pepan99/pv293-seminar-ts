import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '../../../../shared-kernel/infrastructure/database/database';
import {
  InsertableAccounts,
  SelectableAccounts,
  UpdateableAccounts,
} from '../../core/entities/accounts.entity';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

@Injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(private readonly db: Database) {}

  async create(
    id: string,
    data: InsertableAccounts,
    userId: string,
  ): Promise<SelectableAccounts> {
    const createdAccount = await this.db
      .insertInto('accounts')
      .values({
        id,
        ...data,
        isActive: true,
        lastReconciled: new Date(),
        initialBalance: 0,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    if (!createdAccount) throw Error('Unable to create account');

    return createdAccount;
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<SelectableAccounts | undefined> {
    const account = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return account;
  }

  async findAll(userId: string): Promise<SelectableAccounts[]> {
    return await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('userId', '=', userId)
      .execute();
  }

  async update(
    id: string,
    data: UpdateableAccounts,
    userId: string,
  ): Promise<SelectableAccounts | undefined> {
    const account = await this.findOne(id, userId);
    if (!account) {
      return undefined;
    }

    return await this.db
      .updateTable('accounts')
      .set({
        ...data,
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
