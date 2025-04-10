import { NotFoundException } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/database/repositories/users.repository';

export class GetUserByEmailQuery implements IQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(query: GetUserByEmailQuery) {
    const user = await this.usersRepository.findByEmail(query.email);

    if (!user) {
      throw new NotFoundException(`User with email ${query.email} not found`);
    }

    return user;
  }
}
