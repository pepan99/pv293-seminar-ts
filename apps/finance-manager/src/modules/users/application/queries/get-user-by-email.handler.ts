import { NotFoundException, Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IUsersRepository } from '../../core/repositories/users-repository.interface';

export class GetUserByEmailQuery implements IQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
  ) {}

  async execute(query: GetUserByEmailQuery) {
    const user = await this.usersRepository.findByEmail(query.email);

    if (!user) {
      throw new NotFoundException(`User with email ${query.email} not found`);
    }

    return user;
  }
}
