import { Injectable, NotFoundException } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Database } from '../../../../shared-kernel/infrastructure/database/database';
import { AccountAggregate } from '../../core/aggregates/account.aggregate';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';

@Injectable()
export class AccountAggregateRepository implements IAccountAggregateRepository {
  constructor(
    private readonly db: Database,
    private readonly publisher: EventPublisher,
  ) {}

  /**
   * Nájde účet podľa ID
   */
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
      id: accountData.id,
      name: accountData.name,
      accountType: accountData.accountType,
      currency: accountData.currency,
      userId: accountData.userId,
      description: accountData.description ?? undefined,
      icon: accountData.icon ?? undefined,
      color: accountData.color ?? undefined,
      initialBalance: accountData.initialBalance ?? 0,
      createdAt: accountData.createdAt,
      updatedAt: accountData.updatedAt,
    });

    return accountAggregate;
  }

  /**
   * Uloží stav agregátu (len commitne eventy)
   */
  save(aggregate: AccountAggregate): void {
    aggregate.commit();
  }

  /**
   * Vytvorí nový účet a uloží ho do DB
   */
  async createAccount(aggregate: AccountAggregate): Promise<void> {
    await this.db
      .insertInto('accounts')
      .values({
        id: aggregate.id,
        name: aggregate.name,
        accountType: aggregate.accountType,
        currency: aggregate.currency,
        userId: aggregate.userId,
        description: aggregate.description,
        icon: aggregate.icon,
        color: aggregate.color,
        initialBalance: aggregate.initialBalance,
        createdAt: aggregate.createdAt,
        updatedAt: aggregate.updatedAt,
        isActive: true,
        lastReconciled: new Date(),
      })
      .execute();

    aggregate.commit();
  }

  /**
   * Aktualizuje existujúci účet
   */
  async updateAccount(aggregate: AccountAggregate): Promise<void> {
    const result = await this.db
      .updateTable('accounts')
      .set({
        name: aggregate.name,
        description: aggregate.description,
        icon: aggregate.icon,
        color: aggregate.color,
        initialBalance: aggregate.initialBalance,
        updatedAt: aggregate.updatedAt,
      })
      .where('id', '=', aggregate.id)
      .where('userId', '=', aggregate.userId)
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException(
        `Account with ID ${aggregate.id} not found for user ${aggregate.userId}`,
      );
    }

    aggregate.commit();
  }

  /**
   * Odstráni účet
   */
  async removeAccount(aggregate: AccountAggregate): Promise<void> {
    await this.db
      .deleteFrom('accounts')
      .where('id', '=', aggregate.id)
      .where('userId', '=', aggregate.userId)
      .execute();

    aggregate.commit();
  }

  /**
   * Načítanie všetkých účtov pre daného používateľa (bez eventov)
   */
  async findAll(userId: string): Promise<AccountAggregate[]> {
    const accounts = await this.db
      .selectFrom('accounts')
      .selectAll()
      .where('userId', '=', userId)
      .execute();

    return accounts.map((account) => {
      const aggregate = new AccountAggregate(account.id);
      aggregate.loadState({
        id: account.id,
        name: account.name,
        accountType: account.accountType,
        currency: account.currency,
        userId: account.userId,
        description: account.description ?? undefined,
        icon: account.icon ?? undefined,
        color: account.color ?? undefined,
        initialBalance: account.initialBalance ?? 0,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      });
      return aggregate;
    });
  }
}
