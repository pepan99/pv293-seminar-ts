import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

export class GetAccountByIdQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}

@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler
  implements IQueryHandler<GetAccountByIdQuery>
{
  constructor(
    @Inject('IAccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute(_query: GetAccountByIdQuery) {
    const account = await this.accountsRepository.findOne(
      _query.id,
      _query.userId,
    );

    return account;
  }
}
