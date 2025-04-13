import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountAggregateRepository } from "../../infrastructure/database/repositories/accounts-aggregate.repository";

export class GetTotalBalanceQuery implements IQuery {
    constructor(public readonly userId: string) {}
}

@QueryHandler(GetTotalBalanceQuery)
export class GetTotalBalanceQueryHandler implements IQueryHandler<GetTotalBalanceQuery> {
    constructor(private readonly accountAggregateRepository: AccountAggregateRepository) {}

    async execute(query: GetTotalBalanceQuery): Promise<{ totalBalance: number }> {
        const { userId } = query;

        const accountAggregates = await this.accountAggregateRepository.getAllUserAccounts(userId);

        const totalBalance = accountAggregates.reduce(
            (sum, account) => sum + account.initialBalance,
            0,
        );

        return { totalBalance };
    }
}
