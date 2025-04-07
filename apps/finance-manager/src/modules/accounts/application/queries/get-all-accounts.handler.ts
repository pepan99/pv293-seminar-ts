import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountAggregateRepository } from '../../infrastructure/repositories/accounts-aggregate.repository';
import { Account } from '../../core/entities/accounts.entity';

export class GetAllAccountsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler
  implements IQueryHandler<GetAllAccountsQuery>
{
  constructor(
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(query: GetAllAccountsQuery): Promise<Account[]> {
    const { userId } = query;

    const accountAggregates =
      await this.accountAggregateRepository.getAllUserAccounts(userId);

    // Convert the aggregates to the expected Account entity type
    return accountAggregates.map((accountAggregate) => ({
      id: accountAggregate.id,
      name: accountAggregate.name,
      accountType: accountAggregate.accountType,
      currency: accountAggregate.currency,
      description: accountAggregate.description,
      initialBalance: accountAggregate.initialBalance,
      isActive: accountAggregate.isActive,
      lastReconciled: accountAggregate.lastReconciled,
      color: accountAggregate.color,
      icon: accountAggregate.icon,
      userId: accountAggregate.userId,
      createdAt: accountAggregate.createdAt,
      updatedAt: accountAggregate.updatedAt,
    }));
  }
}
