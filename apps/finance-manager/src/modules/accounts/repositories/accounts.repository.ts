import {Injectable} from '@nestjs/common';
import {Database} from '../../database/database';
import {Accounts} from '../../../common/types/db';
import {Insertable, Updateable} from 'kysely/dist/cjs/util/column-type';

type AccountInsertable = Insertable<Omit<Accounts, 'id' | 'userId'>>;
type AccountUpdateable = Updateable<Accounts>;

@Injectable()
export class AccountsRepository {
  constructor(private readonly db: Database) {}

  async create(data: AccountInsertable, userId: string) {
    const id = crypto.randomUUID();

    const account = await this.db
      .insertInto('accounts')
      .values({
        ...data,
        id,
        userId,
        isActive: true,
        lastReconciled: new Date(),
        initialBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning([
        'id',
        'name',
        'description',
        'accountType',
        'initialBalance',
        'currency',
        'isActive',
        'lastReconciled',
        'icon',
        'color',
        'userId',
        'createdAt',
        'updatedAt',
      ])
      .executeTakeFirst();

    if (!account) {
      throw Error('Unable to create account');
    }

    return account;
  }

  async findOne(id: string, userId: string): Promise<Accounts | undefined> {
    const account = await this.db
      .selectFrom('accounts')
      .select([
        'id',
        'name',
        'description',
        'accountType',
        'initialBalance',
        'currency',
        'isActive',
        'lastReconciled',
        'icon',
        'color',
        'userId',
        'createdAt',
        'updatedAt',
      ])
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst();

    return account;
  }

  async findAll(userId: string): Promise<Accounts[]> {
    return this.db
      .selectFrom('accounts')
      .select([
        'id',
        'name',
        'description',
        'accountType',
        'initialBalance',
        'currency',
        'isActive',
        'lastReconciled',
        'icon',
        'color',
        'userId',
        'createdAt',
        'updatedAt',
      ])
      .where('userId', '=', userId)
      .orderBy('name', 'asc')
      .execute();
  }

  async update(id: string, userId: string, data: AccountUpdateable) {
    const account = await this.db
      .updateTable('accounts')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .where('userId', '=', userId)
      .returning([
        'id',
        'name',
        'description',
        'accountType',
        'initialBalance',
        'currency',
        'isActive',
        'lastReconciled',
        'icon',
        'color',
        'userId',
        'createdAt',
        'updatedAt',
      ])
      .executeTakeFirst();

    if (!account) {
      throw Error('Unable to update account');
    }

    return account;
  }

  async remove(id: string, userId: string) {
    const account = await this.db
      .deleteFrom('accounts')
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst();

    if (!account) {
      throw Error('Unable to delete account');
    }

    return;
  }

  async getAccountBalance(id: string, userId: string): Promise<number> {
    const account = await this.db
      .selectFrom('accounts')
      .select(['initialBalance'])
      .where('id', '=', id)
      .where('userId', '=', userId)
      .executeTakeFirst();

    if (!account) {
      throw Error(`Account with ID ${id} not found`);
    }

    return Number(account.initialBalance);
  }
}
