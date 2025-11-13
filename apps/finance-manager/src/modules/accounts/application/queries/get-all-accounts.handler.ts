import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SelectableAccounts } from '../../core/entities/accounts.entity';
import { Inject } from '@nestjs/common';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';
import { AccountAggregate } from '../../core/aggregates/account.aggregate';

export class GetAllAccountsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler
  implements IQueryHandler<GetAllAccountsQuery>
{
  constructor(
    @Inject('IAccountAggregateRepository')
    private readonly accountsRepository: IAccountAggregateRepository,
  ) {}

  async execute(query: GetAllAccountsQuery): Promise<AccountAggregate[]> {
    const { userId } = query;

    return this.accountsRepository.findAll(userId);
  }
}
