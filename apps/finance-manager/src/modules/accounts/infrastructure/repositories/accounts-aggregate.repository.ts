import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AccountAggregate } from '../../core/aggregates/accounts.aggregate';
import { Database } from '../../../../shared-kernel/infrastructure/database/database';
import { IAccountsAggregateRepository } from '../../core/repositories/accounts-aggregate-repository.interface';

@Injectable()
export class AccountAggregateRepository
  implements IAccountsAggregateRepository
{
  constructor(
    private readonly db: Database,
    private readonly publisher: EventPublisher,
  ) {}

  async findById(id: string): Promise<AccountAggregate | null> {
    const accountData = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!accountData) return null;
    const accountAggregate = this.publisher.mergeObjectContext(
      new AccountAggregate(accountData.id),
    );

    accountAggregate.loadState({
      ...accountData,
      initialBalance: Number(accountData.initialBalance),
    });

    return accountAggregate;
  }

  async findByUserId(userId: string): Promise<AccountAggregate[]> {
    const accountsData = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('userId', '=', userId)
      .execute();

    if (accountsData.length === 0) return [];

    const accountAggregates = accountsData.map((accountData) => {
      const accountAggregate = this.publisher.mergeObjectContext(
        new AccountAggregate(accountData.id),
      );

      accountAggregate.loadState({
        ...accountData,
        initialBalance: Number(accountData.initialBalance),
      });

      return accountAggregate;
    });

    return accountAggregates;
  }

  async findByName(
    name: string,
    userId: string,
  ): Promise<AccountAggregate | null> {
    const accountData = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('name', '=', name)
      .where('userId', '=', userId)
      .executeTakeFirst();

    if (!accountData) return null;

    const accountAggregate = this.publisher.mergeObjectContext(
      new AccountAggregate(accountData.id),
    );

    accountAggregate.loadState({
      ...accountData,
      initialBalance: Number(accountData.initialBalance),
    });

    return accountAggregate;
  }

  save(accountAggregate: AccountAggregate): void {
    accountAggregate.commit();
  }

  saveWithTransaction(accountAggregate: AccountAggregate): void {
    accountAggregate.commit();
  }

  async createAccount(aggregate: AccountAggregate): Promise<void> {
    const id = aggregate.id;

    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('accounts')
        .values({
          id,
          userId: aggregate.userId,
          name: aggregate.name,
          accountType: aggregate.accountType,
          initialBalance: aggregate.initialBalance,
          icon: aggregate.icon,
          lastReconciled: aggregate.lastReconciled,
          color: aggregate.color,
          description: aggregate.description,
          isActive: aggregate.isActive,
          currency: aggregate.currency,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();
    });
    aggregate.commit();
  }

  async updateAccount(aggregate: AccountAggregate): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx
        .updateTable('accounts')
        .set({
          name: aggregate.name,
          accountType: aggregate.accountType,
          initialBalance: aggregate.initialBalance,
          icon: aggregate.icon,
          lastReconciled: aggregate.lastReconciled,
          color: aggregate.color,
          description: aggregate.description,
          isActive: aggregate.isActive,
          currency: aggregate.currency,
          updatedAt: new Date(),
        })
        .where('id', '=', aggregate.id)
        .execute();
    });
    aggregate.commit();
  }

  async removeAccount(aggregate: AccountAggregate): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx.deleteFrom('accounts').where('id', '=', aggregate.id).execute();
    });
    aggregate.commit();
  }
}
