import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '../../../shared-kernel/infrastructure/database/database';
import {
  CreateAccountDto,
  UpdateAccountDto,
} from '../../api/dtos/accounts-zod.dtos';
import { Account } from '../../core/entities/accounts.entity';

@Injectable()
export class AccountsRepository {
  constructor(private readonly db: Database) {}

  async create(data: CreateAccountDto, userId: string) {
    const id = crypto.randomUUID();

    const account = await this.db
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

    if (!account) throw Error('Unable to create user');

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
    data: UpdateAccountDto,
    userId: string,
  ): Promise<Account | undefined> {
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

  async getAccountBalance(
    id: string,
    userId: string,
  ): Promise<{ balance: number }> {
    const account = await this.findOne(id, userId);

    if (!account)
      throw new NotFoundException(`Account with id: ${id} not found.`);

    return {
      balance: Number(account.initialBalance),
    };
  }

  async getBalanceForAllUserAccounts(userId: string) {
    const accounts = await this.findAll(userId);

    return accounts.reduce((x, y) => x + Number(y.initialBalance), 0);
  }
}
