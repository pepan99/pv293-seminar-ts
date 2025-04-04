import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../../api/dto/zod-dtos';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserAggregateRepository } from '../../infrastructure/repositories/users-aggregate.repository';

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
  constructor(private userAggregateRepository: UserAggregateRepository) {}

  async execute(command: UpdateUserCommand): Promise<{ id: string }> {
    const userAggregate = await this.userAggregateRepository.findById(
      command.id,
    );

    if (!userAggregate) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    userAggregate.update({
      email: command.updateUserDto.email,
      name: command.updateUserDto.name,
    });

    await this.userAggregateRepository.updateUser(userAggregate);

    return { id: userAggregate.id };
  }
}
