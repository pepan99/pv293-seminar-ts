import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountsRepository } from '../../infrastructure/repositories/accounts.repository';
import { NotFoundException } from '@nestjs/common';

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
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(query: GetAccountBalanceQuery): Promise<{ balance: number }> {
    const { id, userId } = query;

    try {
      return await this.accountsRepository.getAccountBalance(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }
}
