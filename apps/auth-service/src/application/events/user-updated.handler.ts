import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { UserUpdatedMappedEvent } from "../../infrastructure/anti-corruption-layer/user-updated.mapper";
import { IUsersRepository } from "../../core/repositories/users-repository.interface";

@EventsHandler(UserUpdatedMappedEvent)
export class UserUpdatedEventHandler
  implements IEventHandler<UserUpdatedMappedEvent>
{
  private readonly logger = new Logger(UserUpdatedEventHandler.name);

  constructor(
    @Inject("IUsersRepository")
    private readonly usersRepository: IUsersRepository,
  ) {}

  async handle(event: UserUpdatedMappedEvent) {
    this.logger.log(`Handling UserUpdatedMappedEvent for user ${event.id}`);

    try {
      await this.usersRepository.update(event.id, {
        email: event.email,
        name: event.name,
      });
      this.logger.log(`Successfully updated user ${event.id} in auth service`);
    } catch (error) {
      this.logger.error(`Failed to update user ${event.id}: ${error}`);
    }
  }
}
