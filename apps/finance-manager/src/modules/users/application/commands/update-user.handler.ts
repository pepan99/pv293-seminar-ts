import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../../api/dto/zod-dtos';
import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UserAggregateRepository } from '../../infrastructure/database/repositories/users-aggregate.repository';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler
  implements ICommandHandler<UpdateUserCommand>
{
  constructor(
    private readonly userAggregateRepository: UserAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateUserCommand) {
    const userAggregate = await this.userAggregateRepository.findById(
      command.id,
    );

    if (!userAggregate) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    const mergedUserAggregate =
      this.publisher.mergeObjectContext(userAggregate);

    mergedUserAggregate.update({
      email: command.updateUserDto.email,
      name: command.updateUserDto.name,
    });

    await this.userAggregateRepository.updateUser(mergedUserAggregate);

    return { id: mergedUserAggregate.id };
  }
}
