import { Inject, NotFoundException } from '@nestjs/common';
import { Account } from '../../core/entities/accounts.entity';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class FindOneAccountQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@QueryHandler(FindOneAccountQuery)
export class FindOneAccountQueryHandler
  implements IQueryHandler<FindOneAccountQuery>
{
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(query: FindOneAccountQuery): Promise<Account> {
    const account = await this.accountsRepository.findOne(
      query.id,
      query.userId,
    );

    if (!account) {
      throw new NotFoundException(`Account with ID ${query.id} not found`);
    }

    return account;
  }
}
