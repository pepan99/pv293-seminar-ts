import { Inject } from "@nestjs/common";
import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { IUsersRepository } from "../../core/repositories/users-repository.interface";

export class GetAllUsersQuery implements IQuery {
  constructor() {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler
  implements IQueryHandler<GetAllUsersQuery>
{
  constructor(
    @Inject("IUsersRepository") private usersRepository: IUsersRepository,
  ) {}

  async execute(_query: GetAllUsersQuery) {
    const users = await this.usersRepository.findAll();

    return users;
  }
}
