import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

export class GetAccountBalanceQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}

@QueryHandler(GetAccountBalanceQuery)
export class GetAccountBalanceQueryHandler
  implements IQueryHandler<GetAccountBalanceQuery>
{
  constructor(
    @Inject('IAccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute(_query: GetAccountBalanceQuery) {
    const ballance = await this.accountsRepository.getBalance(
      _query.id,
      _query.userId,
    );

    return ballance;
  }
}
