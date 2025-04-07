import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../../infrastructure/repositories/accounts.repository';
import { Account } from '../../core/entities/accounts.entity';

export class GetAllAccountsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler
  implements IQueryHandler<GetAllAccountsQuery>
{
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(query: GetAllAccountsQuery): Promise<Account[]> {
    const { userId } = query;

    return this.accountsRepository.findAll(userId);
  }
}
