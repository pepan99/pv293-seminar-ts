import { IQuery, IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetUserByEmailWithPasswordQuery } from '../../../../users/application/queries/get-user-by-email-with-password.handler';
import { UserWithRoles } from '../../../../users/core/entities/user.entity';
import { MappedUserWithPassword } from './mapped-user.model';

export class GetUserByEmailWithPasswordMappedQuery implements IQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailWithPasswordMappedQuery)
export class GetUserByEmailWithPasswordMappedQueryHandler
  implements IQueryHandler<GetUserByEmailWithPasswordMappedQuery>
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetUserByEmailWithPasswordMappedQuery) {
    const user: UserWithRoles | undefined = await this.queryBus.execute(
      new GetUserByEmailWithPasswordQuery(query.email),
    );

    if (!user) {
      throw new NotFoundException(`User with email ${query.email} not found`);
    }

    return new MappedUserWithPassword(
      user.email,
      user.id,
      user.name,
      user.roles,
      user.password,
    );
  }
}
