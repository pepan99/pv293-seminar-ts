import { CreateUserDto } from '../../api/dto/zod-dtos';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserAggregateRepository } from '../../infrastructure/repositories/users-aggregate.repository';
import { BadRequestException } from '@nestjs/common';
import { UserAggregate } from '../../core/aggregates/users.aggregate';

export class CreateUserCommand implements ICommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(private userAggregateRepository: UserAggregateRepository) {}

  async execute(command: CreateUserCommand): Promise<{ id: string }> {
    const existingUser = await this.userAggregateRepository.findByEmail(
      command.createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const userAggregate = new UserAggregate();

    await userAggregate.create(
      command.createUserDto.email,
      command.createUserDto.name,
      command.createUserDto.password,
    );

    await this.userAggregateRepository.createUser(userAggregate);

    return { id: userAggregate.id };
  }
}
