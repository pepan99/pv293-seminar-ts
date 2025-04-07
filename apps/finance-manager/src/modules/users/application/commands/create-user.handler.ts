import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { UserAggregate } from '../../core/aggregates/users.aggregate';
import { IUserAggregateRepository } from '../../core/repositories/user-aggregate-repository.interface';

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
  constructor(
    @Inject('IUsersAggregateRepository')
    private usersAggregateRepository: IUserAggregateRepository,
    private publisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand) {
    const existingUser = await this.usersAggregateRepository.findByEmail(
      command.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const userAggregate = this.publisher.mergeObjectContext(
      new UserAggregate(),
    );

    await userAggregate.create(command.email, command.name, command.password);

    await this.usersAggregateRepository.createUser(userAggregate);

    return { id: userAggregate.id };
  }
}
