import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../../infrastructure/repositories/accounts.repository';

export class GetTotalBalanceQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetTotalBalanceQuery)
export class GetTotalBalanceQueryHandler
  implements IQueryHandler<GetTotalBalanceQuery>
{
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(
    query: GetTotalBalanceQuery,
  ): Promise<{ totalBalance: number }> {
    const { userId } = query;

    const totalBalance =
      await this.accountsRepository.getBalanceForAllUserAccounts(userId);

    return { totalBalance };
  }
}
