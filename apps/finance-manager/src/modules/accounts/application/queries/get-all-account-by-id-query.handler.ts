import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

export class GetAllAccountsByUserIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetAllAccountsByUserIdQuery)
export class GetAllAccountsByUserIdQueryHandler
  implements IQueryHandler<GetAllAccountsByUserIdQuery>
{
  constructor(
    @Inject('IAccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute(_query: GetAllAccountsByUserIdQuery) {
    const accounts = await this.accountsRepository.findAll(_query.userId);

    return accounts;
  }
}
