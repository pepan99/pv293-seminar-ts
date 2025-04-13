import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountAggregateRepository } from "../../infrastructure/database/repositories/accounts-aggregate.repository";
import { NotFoundException } from "@nestjs/common";
import { AccountAggregate } from "../../core/aggregates/account.aggregate";

export class GetAccountByIdAggregateQuery implements IQuery {
    constructor(
        public readonly id: string,
        public readonly userId: string,
    ) {}
}

@QueryHandler(GetAccountByIdAggregateQuery)
export class GetAccountByIdAggregateQueryHandler
    implements IQueryHandler<GetAccountByIdAggregateQuery>
{
    constructor(private readonly accountAggregateRepository: AccountAggregateRepository) {}

    async execute(query: GetAccountByIdAggregateQuery): Promise<AccountAggregate> {
        const { id, userId } = query;

        const accountAggregate = await this.accountAggregateRepository.findById(id, userId);

        if (!accountAggregate) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }

        return accountAggregate;
    }
}
