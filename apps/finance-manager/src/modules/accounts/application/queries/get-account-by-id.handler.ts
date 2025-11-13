import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SelectableAccounts } from '../../core/entities/accounts.entity';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';
import { AccountAggregate } from '../../core/aggregates/account.aggregate';

export class GetAccountByIdQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler
  implements IQueryHandler<GetAccountByIdQuery>
{
  constructor(
    @Inject('IAccountAggregateRepository')
    private readonly accountsRepository: IAccountAggregateRepository,
  ) {}

  async execute(query: GetAccountByIdQuery): Promise<AccountAggregate> {
    const { id, userId } = query;

    const account = await this.accountsRepository.findById(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }
}
