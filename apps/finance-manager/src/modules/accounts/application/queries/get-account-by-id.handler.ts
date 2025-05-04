import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SelectableAccounts } from '../../core/entities/accounts.entity';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

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
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(query: GetAccountByIdQuery): Promise<SelectableAccounts> {
    const { id, userId } = query;

    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }
}
