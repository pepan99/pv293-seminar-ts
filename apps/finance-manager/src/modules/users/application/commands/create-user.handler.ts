import { CreateUserDto } from '../../api/dto/zod-dtos';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UserAggregate } from '../../core/aggregates/users.aggregate';
import { UserAggregateRepository } from '../../infrastructure/repositories/users-aggregate.repository';
import { CommandSucceededWithId } from '../../../../shared/types/return-types';

export class CreateUserCommand implements ICommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(private usersAggregateRepository: UserAggregateRepository) {}

  async execute(command: CreateUserCommand): CommandSucceededWithId {
    const existingUser = await this.usersAggregateRepository.findByEmail(
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

    await this.usersAggregateRepository.createUser(userAggregate);

    userAggregate.commit();

    return { id: userAggregate.id };
  }
}
