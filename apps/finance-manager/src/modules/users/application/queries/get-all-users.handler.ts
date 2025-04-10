import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/database/repositories/users.repository';

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
