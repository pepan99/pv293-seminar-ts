import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserUpdatedMappedEvent } from "../../infrastructure/anti-corruption-layer/user-edited.mapper";
import { UsersRepository } from "../../infrastructure/database/repositories/users.repository";

@EventsHandler(UserUpdatedMappedEvent)
export class UserUpdatedMappedEventHandler
  implements IEventHandler<UserUpdatedMappedEvent>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async handle(event: UserUpdatedMappedEvent) {
    await this.usersRepository.update(event.id, {
      email: event.email,
      name: event.name,
    });
  }
}
