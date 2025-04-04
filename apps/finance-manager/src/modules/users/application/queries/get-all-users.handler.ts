import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetAllUsersQuery implements IQuery {
  constructor() {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler
  implements IQueryHandler<GetAllUsersQuery>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(_query: GetAllUsersQuery) {
    const users = await this.usersRepository.findAll();

    return users;
  }
}
