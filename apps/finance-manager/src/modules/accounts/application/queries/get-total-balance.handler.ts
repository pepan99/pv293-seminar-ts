import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

export class GetTotalBalanceQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetTotalBalanceQuery)
export class GetTotalBalanceQueryHandler
  implements IQueryHandler<GetTotalBalanceQuery> {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(query: GetTotalBalanceQuery): Promise<number> {
    return this.accountsRepository.getTotalBalance(query.userId);
  }
}
