import { NotFoundException, Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IUsersRepository } from '../../core/repositories/users-repository.interface';

export class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery>
{
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
  ) {}

  async execute(query: GetUserByIdQuery) {
    const user = await this.usersRepository.findOne(query.userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }

    return user;
  }
}
