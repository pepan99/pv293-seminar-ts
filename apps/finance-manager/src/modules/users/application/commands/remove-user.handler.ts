import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserAggregateRepository } from '../../infrastructure/repositories/users-aggregate.repository';

export class RemoveUserCommand implements ICommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserCommandHandler
  implements ICommandHandler<RemoveUserCommand>
{
  constructor(private userAggregateRepository: UserAggregateRepository) {}

  async execute(command: RemoveUserCommand) {
    const userAggregate = await this.userAggregateRepository.findById(
      command.id,
    );

    if (!userAggregate) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    userAggregate.remove();

    await this.userAggregateRepository.removeUser(userAggregate);

    return { id: userAggregate.id };
  }
}
