import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetUserByEmailWithPasswordQuery implements IQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailWithPasswordQuery)
export class GetUserByEmailWithPasswordQueryHandler
  implements IQueryHandler<GetUserByEmailWithPasswordQuery>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(query: GetUserByEmailWithPasswordQuery) {
    const user = await this.usersRepository.findByEmailWithPassword(
      query.email,
    );

    if (!user) {
      throw new NotFoundException(`User with email ${query.email} not found`);
    }

    return user;
  }
}
