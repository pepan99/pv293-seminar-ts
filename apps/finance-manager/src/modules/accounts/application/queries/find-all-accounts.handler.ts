import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Account } from '../../core/entities/accounts.entity';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

export class FindAllAccountsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(FindAllAccountsQuery)
export class FindAllAccountsQueryHandler
  implements IQueryHandler<FindAllAccountsQuery> {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(query: FindAllAccountsQuery): Promise<Account[]> {
    return this.accountsRepository.findAll(query.userId);
  }
}
