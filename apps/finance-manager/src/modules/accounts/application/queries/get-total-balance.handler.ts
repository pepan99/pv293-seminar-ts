import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';

export class GetTotalBalanceQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetTotalBalanceQuery)
export class GetTotalBalanceQueryHandler
  implements IQueryHandler<GetTotalBalanceQuery>
{
  constructor(
    @Inject('IAccountAggregateRepository')
    private readonly accountsRepository: IAccountAggregateRepository,
  ) {}

  async execute(
    query: GetTotalBalanceQuery,
  ): Promise<{ totalBalance: number }> {
    const { userId } = query;

    const totalBalance = (await this.accountsRepository.findAll(userId))
      .map((account) => parseFloat(account.initialBalance)) // prevod na číslo
      .reduce((sum, value) => sum + value, 0);

    return { totalBalance };
  }
}
