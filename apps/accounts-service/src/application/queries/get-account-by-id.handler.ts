import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountAggregateRepository } from "../../infrastructure/database/repositories/accounts-aggregate.repository";
import { NotFoundException } from "@nestjs/common";
import { Account } from "../../core/entities/accounts.entity";

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
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(query: GetAccountByIdQuery): Promise<Account> {
    const { id, userId } = query;

    const accountAggregate = await this.accountAggregateRepository.findById(
      id,
      userId,
    );

    if (!accountAggregate) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    // Convert the aggregate to the expected Account entity type
    return {
      id: accountAggregate.id,
      name: accountAggregate.name,
      accountType: accountAggregate.accountType,
      currency: accountAggregate.currency,
      description: accountAggregate.description,
      initialBalance: accountAggregate.initialBalance,
      isActive: accountAggregate.isActive,
      lastReconciled: accountAggregate.lastReconciled,
      color: accountAggregate.color,
      icon: accountAggregate.icon,
      userId: accountAggregate.userId,
      createdAt: accountAggregate.createdAt,
      updatedAt: accountAggregate.updatedAt,
    };
  }
}
