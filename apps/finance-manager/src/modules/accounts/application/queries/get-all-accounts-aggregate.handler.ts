import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountAggregateRepository } from '../../infrastructure/repositories/accounts-aggregate.repository';
import { AccountAggregate } from '../../core/aggregates/account.aggregate';

export class GetAllAccountsAggregateQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetAllAccountsAggregateQuery)
export class GetAllAccountsAggregateQueryHandler
  implements IQueryHandler<GetAllAccountsAggregateQuery>
{
  constructor(
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(
    query: GetAllAccountsAggregateQuery,
  ): Promise<AccountAggregate[]> {
    const { userId } = query;

    return this.accountAggregateRepository.getAllUserAccounts(userId);
  }
}
