import { IQuery, IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserWithoutPassword } from '../../../../../users/core/entities/user.entity';
import { MappedUser } from '../mapped-user.model';
import { GetUserByIdQuery } from '../../../../../users/application/queries/get-user-by-id.handler';

export class GetUserByIdMappedQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserByIdMappedQuery)
export class GetUserByIdMappedQueryHandler
  implements IQueryHandler<GetUserByIdMappedQuery>
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetUserByIdMappedQuery) {
    const user: UserWithoutPassword | undefined = await this.queryBus.execute(
      new GetUserByIdQuery(query.id),
    );

    if (!user) {
      throw new NotFoundException(`User with id ${query.id} not found`);
    }

    return new MappedUser(user.email, user.id, user.name, user.roles);
  }
}
