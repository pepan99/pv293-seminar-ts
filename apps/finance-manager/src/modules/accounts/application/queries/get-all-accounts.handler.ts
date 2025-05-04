import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { SelectableAccounts } from "../../core/entities/accounts.entity";
import { IAccountsAggregateRepository } from "../../core/repositories/accounts-aggregate-repository.interface";

export class GetAllAccountsQuery implements IQuery {
    constructor(public readonly userId: string) {}
}

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler implements IQueryHandler<GetAllAccountsQuery> {
    constructor(
        @Inject("IAccountsAggregateRepository")
        private readonly accountAggregateRepository: IAccountsAggregateRepository,
    ) {}

    async execute(query: GetAllAccountsQuery): Promise<SelectableAccounts[]> {
        const { userId } = query;

        const accountAggregates = await this.accountAggregateRepository.getAllUserAccounts(userId);

        return accountAggregates.map((accountAggregate) => ({
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
        }));
    }
}
