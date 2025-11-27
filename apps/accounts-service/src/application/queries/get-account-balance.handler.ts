import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IAccountsRepository } from "../../core/repositories/accounts-repository.interface";

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
    @Inject("IAccountsRepository")
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(query: GetAccountBalanceQuery) {
    const balance = await this.accountsRepository.getBalance(
      query.id,
      query.userId,
    );
    return { balance };
  }
}
