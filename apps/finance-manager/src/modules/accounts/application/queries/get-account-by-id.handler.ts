import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SelectableAccounts } from '../../core/entities/accounts.entity';
import { IAccountsAggregateRepository } from '../../core/repositories/accounts-aggregate-repository.interface';

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
    @Inject('IAccountsAggregateRepository')
    private readonly accountAggregateRepository: IAccountsAggregateRepository,
  ) {}

  async execute(query: GetAccountByIdQuery): Promise<SelectableAccounts> {
    const { id, userId } = query;

    const accountAggregate = await this.accountAggregateRepository.findById(
      id,
      userId,
    );

    if (!accountAggregate) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return {
      id: accountAggregate.id,
      name: accountAggregate.name,
      accountType: accountAggregate.accountType,
      currency: accountAggregate.currency,
      description: accountAggregate.description,
      initialBalance: String(accountAggregate.initialBalance),
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
