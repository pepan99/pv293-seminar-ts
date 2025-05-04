import { Inject, NotFoundException } from "@nestjs/common";
import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { IUsersRepository } from "../../core/repositories/users-repository.interface";

export class GetUserByEmailWithPasswordQuery implements IQuery {
    constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailWithPasswordQuery)
export class GetUserByEmailWithPasswordQueryHandler
    implements IQueryHandler<GetUserByEmailWithPasswordQuery>
{
    constructor(@Inject("IUsersRepository") private usersRepository: IUsersRepository) {}

    async execute(query: GetUserByEmailWithPasswordQuery) {
        const user = await this.usersRepository.findByEmailWithPassword(query.email);

        if (!user) {
            throw new NotFoundException(`User with email ${query.email} not found`);
        }

        return user;
    }
}
