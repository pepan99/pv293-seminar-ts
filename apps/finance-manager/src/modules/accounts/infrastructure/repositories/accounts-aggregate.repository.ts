import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AccountAggregate } from '../../core/aggregates/account.aggregate';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { Inject } from '@nestjs/common';

/**
 * Repository for managing AccountAggregate lifecycle
 * Handles loading, persisting, and publishing aggregate events
 */
@Injectable()
export class AccountAggregateRepository {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
    private readonly publisher: EventPublisher,
  ) {}

  /**
   * Finds an account aggregate by ID
   * @param id - Account ID
   * @param userId - User ID for authorization
   * @returns AccountAggregate or null if not found
   */
  async findById(id: string, userId: string): Promise<AccountAggregate | null> {
    // Query database
    const accountData = await this.accountsRepository.findOne(id, userId);

    if (!accountData) {
      return null;
    }

    // Create and populate aggregate
    const aggregate = new AccountAggregate();
    aggregate.loadState(accountData);

    // Return plain aggregate - event publishing context will be merged when persisting
    return aggregate;
  }

  /**
   * Persists a new account aggregate to the database
   * @param aggregate - The aggregate to persist
   */
  async createAccount(aggregate: AccountAggregate): Promise<void> {
    // Merge with event publisher to enable event publishing
    const publishedAggregate = this.publisher.mergeObjectContext(aggregate);

    // Persist to database
    const accountData = {
      name: aggregate.name,
      accountType: aggregate.accountType,
      currency: aggregate.currency,
      ...(aggregate.description && { description: aggregate.description }),
      ...(aggregate.notes && { notes: aggregate.notes }),
      ...(aggregate.icon && { icon: aggregate.icon }),
      ...(aggregate.color && { color: aggregate.color }),
    };

    await this.accountsRepository.create(
      aggregate.id,
      accountData,
      aggregate.userId,
    );

    // Commit events (publishes domain events)
    publishedAggregate.commit();
  }

  /**
   * Updates an account aggregate in the database
   * @param aggregate - The aggregate to update
   */
  async updateAccount(aggregate: AccountAggregate): Promise<void> {
    // Merge with event publisher to enable event publishing
    const publishedAggregate = this.publisher.mergeObjectContext(aggregate);

    // Persist changes to database
    const updateData = {
      name: aggregate.name,
      description: aggregate.description,
      icon: aggregate.icon,
      color: aggregate.color,
    };

    await this.accountsRepository.update(
      aggregate.id,
      updateData,
      aggregate.userId,
    );

    // Commit events (publishes domain events)
    publishedAggregate.commit();
  }

  /**
   * Removes an account aggregate from the database
   * @param aggregate - The aggregate to remove
   */
  async removeAccount(aggregate: AccountAggregate): Promise<void> {
    // Merge with event publisher to enable event publishing
    const publishedAggregate = this.publisher.mergeObjectContext(aggregate);

    // Persist removal to database
    await this.accountsRepository.remove(aggregate.id, aggregate.userId);

    // Commit events (publishes domain events)
    publishedAggregate.commit();
  }
}
