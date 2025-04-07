import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../../infrastructure/repositories/accounts.repository';
import { NotFoundException } from '@nestjs/common';
import { Account } from '../../core/entities/accounts.entity';

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
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(query: GetAccountByIdQuery): Promise<Account> {
    const { id, userId } = query;

    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }
}
