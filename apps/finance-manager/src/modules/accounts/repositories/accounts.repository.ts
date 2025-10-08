import {Injectable} from '@nestjs/common';
import {AccountEntity} from '../entities/accounts.entity';
import {randomUUID} from 'node:crypto';
import {Database} from '../../database/database';
import {AccountInsertable, AccountUpdateable} from '../types/accounts.types';

@Injectable()
export class AccountsRepository {
  constructor(private readonly db: Database) {}

  async create(
    data: AccountInsertable,
    userId: string,
  ): Promise<AccountEntity> {
    const newId = randomUUID();

    const account = await this.db
      .insertInto('accounts')
      .values({
        newId,
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

    if (!account) {
      throw new Error('Unable to create account');
    }

    return account.then(
      ({
        id,
        name,
        description,
        type,
        currency,
        isActive,
        initialBalance,
        lastReconciled,
        createdAt,
        updatedAt,
      }) => ({
        id,
        name,
        description,
        type,
        currency,
        isActive,
        initialBalance,
        lastReconciled,
        createdAt,
        updatedAt,
      }),
    );
  }

  async findAll(userId: string) {
    return await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('name', 'asc')
      .execute();
  }

  async findOne(id: string, userId: string) {
    const account = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return account || undefined;
  }

  async update(id: string, data: AccountUpdateable, userId: string) {
    const account = await this.findOne(id, userId);
    if (!account) {
      return undefined;
    }
  }
}
