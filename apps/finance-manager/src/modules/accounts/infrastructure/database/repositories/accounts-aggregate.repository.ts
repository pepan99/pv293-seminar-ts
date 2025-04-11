import { Injectable } from '@nestjs/common';
import { IAccountsAggregateRepository } from '../../core/repositories/accounts-aggregate-repository.interface';
import { EventPublisher } from '@nestjs/cqrs';
import { AccountAggregate } from '../../core/aggregates/account.aggregate';
import { Database } from '../../../../shared-kernel/infrastructure/database/database';

@Injectable()
export class AccountAggregateRepository
  implements IAccountsAggregateRepository
{
  constructor(
    private readonly db: Database,
    private readonly publisher: EventPublisher,
  ) {}

  async findById(id: string, userId: string): Promise<AccountAggregate | null> {
    const accountData = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('id', '=', id)
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

  async createAccount(aggregate: AccountAggregate): Promise<void> {
    await this.db
      .insertInto('accounts')
      .values({
        id: aggregate.id,
        name: aggregate.name,
        accountType: aggregate.accountType,
        currency: aggregate.currency,
        description: aggregate.description,
        initialBalance: aggregate.initialBalance,
        isActive: aggregate.isActive,
        lastReconciled: aggregate.lastReconciled,
        icon: aggregate.icon,
        color: aggregate.color,
        userId: aggregate.userId,
        createdAt: aggregate.createdAt,
        updatedAt: aggregate.updatedAt,
      })
      .execute();

    aggregate.commit();
  }

  async updateAccount(aggregate: AccountAggregate): Promise<void> {
    await this.db
      .updateTable('accounts')
      .set({
        name: aggregate.name,
        description: aggregate.description,
        icon: aggregate.icon,
        color: aggregate.color,
        updatedAt: aggregate.updatedAt,
      })
      .where('id', '=', aggregate.id)
      .where('userId', '=', aggregate.userId)
      .execute();

    aggregate.commit();
  }

  async updateAccountBalance(aggregate: AccountAggregate): Promise<void> {
    await this.db
      .updateTable('accounts')
      .set({
        initialBalance: aggregate.initialBalance,
        lastReconciled: aggregate.lastReconciled,
        updatedAt: aggregate.updatedAt,
      })
      .where('id', '=', aggregate.id)
      .where('userId', '=', aggregate.userId)
      .execute();

    aggregate.commit();
  }

  async updateAccountStatus(aggregate: AccountAggregate): Promise<void> {
    await this.db
      .updateTable('accounts')
      .set({
        isActive: aggregate.isActive,
        updatedAt: aggregate.updatedAt,
      })
      .where('id', '=', aggregate.id)
      .where('userId', '=', aggregate.userId)
      .execute();

    aggregate.commit();
  }

  async removeAccount(aggregate: AccountAggregate): Promise<void> {
    await this.db
      .deleteFrom('accounts')
      .where('id', '=', aggregate.id)
      .where('userId', '=', aggregate.userId)
      .execute();

    aggregate.commit();
  }

  async getAllUserAccounts(userId: string): Promise<AccountAggregate[]> {
    const accountsData = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('userId', '=', userId)
      .execute();

    return accountsData.map((accountData) => {
      const accountAggregate = this.publisher.mergeObjectContext(
        new AccountAggregate(accountData.id),
      );

      accountAggregate.loadState({
        ...accountData,
        initialBalance: Number(accountData.initialBalance),
      });

      return accountAggregate;
    });
  }
}
