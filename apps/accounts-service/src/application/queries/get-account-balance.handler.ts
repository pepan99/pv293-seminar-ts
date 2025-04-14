import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountAggregateRepository } from "../../infrastructure/database/repositories/accounts-aggregate.repository";
import { NotFoundException } from "@nestjs/common";

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
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(query: GetAccountBalanceQuery): Promise<{ balance: number }> {
    const { id, userId } = query;

    const accountAggregate = await this.accountAggregateRepository.findById(
      id,
      userId,
    );

    if (!accountAggregate) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return { balance: accountAggregate.initialBalance };
  }
}
