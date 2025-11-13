import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';

export class GetAccountBalanceQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetAccountBalanceQuery)
export class GetAccountBalanceQueryHandler
  implements IQueryHandler<GetAccountBalanceQuery>
{
  constructor(
    @Inject('IAccountAggregateRepository')
    private readonly accountsRepository: IAccountAggregateRepository,
  ) {}

  async execute(query: GetAccountBalanceQuery) {
    const { id, userId } = query;

    try {
      return (await this.accountsRepository.findById(id, userId))
        ?.initialBalance;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }
}
