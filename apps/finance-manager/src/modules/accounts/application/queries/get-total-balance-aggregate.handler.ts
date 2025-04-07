import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountAggregateRepository } from '../../infrastructure/repositories/accounts-aggregate.repository';

export class GetTotalBalanceAggregateQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetTotalBalanceAggregateQuery)
export class GetTotalBalanceAggregateQueryHandler
  implements IQueryHandler<GetTotalBalanceAggregateQuery>
{
  constructor(
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(
    query: GetTotalBalanceAggregateQuery,
  ): Promise<{ totalBalance: number }> {
    const { userId } = query;

    const accounts =
      await this.accountAggregateRepository.getAllUserAccounts(userId);

    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.initialBalance,
      0,
    );

    return { totalBalance };
  }
}
