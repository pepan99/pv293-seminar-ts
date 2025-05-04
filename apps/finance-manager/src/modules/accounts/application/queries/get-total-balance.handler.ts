import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IAccountsRepository } from "../../core/repositories/accounts-repository.interface";

export class GetTotalBalanceQuery implements IQuery {
    constructor(public readonly userId: string) {}
}

@QueryHandler(GetTotalBalanceQuery)
export class GetTotalBalanceQueryHandler implements IQueryHandler<GetTotalBalanceQuery> {
    constructor(
        @Inject("IAccountsRepository")
        private readonly accountsRepository: IAccountsRepository,
    ) {}

    async execute(query: GetTotalBalanceQuery): Promise<{ totalBalance: number }> {
        const { userId } = query;

        const totalBalance = await this.accountsRepository.getTotalBalance(userId);

        return { totalBalance };
    }
}
