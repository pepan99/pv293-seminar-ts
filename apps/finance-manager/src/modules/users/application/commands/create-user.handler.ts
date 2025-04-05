import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UserAggregate } from '../../core/aggregates/users.aggregate';
import { UserAggregateRepository } from '../../infrastructure/repositories/users-aggregate.repository';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(private usersAggregateRepository: UserAggregateRepository) {}

  async execute(command: CreateUserCommand) {
    const existingUser = await this.usersAggregateRepository.findByEmail(
      command.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const userAggregate = new UserAggregate();

    await userAggregate.create(command.email, command.name, command.password);

    await this.usersAggregateRepository.createUser(userAggregate);

    userAggregate.commit();

    return { id: userAggregate.id };
  }
}
