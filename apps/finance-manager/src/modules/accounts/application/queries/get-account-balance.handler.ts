import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IAccountsAggregateRepository } from "../../core/repositories/accounts-aggregate-repository.interface";

export class GetAccountBalanceQuery implements IQuery {
    constructor(
        public readonly id: string,
        public readonly userId: string,
    ) {}
}

@QueryHandler(GetAccountBalanceQuery)
export class GetAccountBalanceQueryHandler implements IQueryHandler<GetAccountBalanceQuery> {
    constructor(
        @Inject("IAccountsAggregateRepository")
        private readonly accountAggregateRepository: IAccountsAggregateRepository,
    ) {}

    async execute(query: GetAccountBalanceQuery): Promise<{ balance: number }> {
        const { id, userId } = query;

        const accountAggregate = await this.accountAggregateRepository.findById(id, userId);

        if (!accountAggregate) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }

        return { balance: accountAggregate.initialBalance };
    }
}
