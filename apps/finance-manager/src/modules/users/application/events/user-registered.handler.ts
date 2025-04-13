import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserRegisteredMappedEvent } from "../../infrastructure/anti-corruption-layer/user-registered.mapper";
import { UsersRepository } from "../../infrastructure/database/repositories/users.repository";

@EventsHandler(UserRegisteredMappedEvent)
export class UserRegisteredMappedEventHandler implements IEventHandler {
    constructor(private readonly usersRepository: UsersRepository) {}
    async handle(event: UserRegisteredMappedEvent) {
        await this.usersRepository.create(event);
    }
}
