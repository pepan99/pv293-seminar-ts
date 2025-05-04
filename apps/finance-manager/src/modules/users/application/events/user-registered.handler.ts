import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserRegisteredMappedEvent } from "../../infrastructure/anti-corruption-layer/user-registered.mapper";
import { IUsersRepository } from "../../core/repositories/users-repository.interface";
import { Inject } from "@nestjs/common";

@EventsHandler(UserRegisteredMappedEvent)
export class UserRegisteredMappedEventHandler implements IEventHandler {
    constructor(@Inject("IUsersRepository") private usersRepository: IUsersRepository) {}

    async handle(event: UserRegisteredMappedEvent) {
        console.log("creating user inside of user module");
        const { roles: _, ...user } = event;
        await this.usersRepository.create(user);
    }
}
