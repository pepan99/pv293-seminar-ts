import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IAccountsRepository } from "../../core/repositories/accounts-repository.interface";

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
    @Inject("IAccountsRepository")
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(query: GetAccountByIdQuery) {
    return this.accountsRepository.findOne(query.id, query.userId);
  }
}
