import { NotFoundException } from '@nestjs/common';
import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UpdateUserAdminDto } from '../../api/dto/zod-dtos';
import { UserRole } from '../../../shared-kernel/core/types/db';
import { UserAggregateRepository } from '../../infrastructure/database/repositories/users-aggregate.repository';

export class UpdateUserAdminCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updateUserDto: UpdateUserAdminDto,
  ) {}
}

@CommandHandler(UpdateUserAdminCommand)
export class UpdateUserAdminCommandHandler
  implements ICommandHandler<UpdateUserAdminCommand>
{
  constructor(
    private readonly userAggregateRepository: UserAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateUserAdminCommand) {
    const userAggregate = await this.userAggregateRepository.findById(
      command.id,
    );

    if (!userAggregate) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    const mergedUserAggregate =
      this.publisher.mergeObjectContext(userAggregate);

    let isLastAdmin = false;
    if (
      mergedUserAggregate.roles.includes('admin') &&
      !command.updateUserDto.roles.includes('admin')
    ) {
      isLastAdmin = this.isLastAdmin(command.id);
    }

    if (command.updateUserDto.email || command.updateUserDto.name) {
      mergedUserAggregate.update({
        email: command.updateUserDto.email,
        name: command.updateUserDto.name,
      });
    }

    userAggregate.updateRoles(
      command.updateUserDto.roles as UserRole[],
      isLastAdmin,
    );

    await this.userAggregateRepository.updateUserWithRoles(mergedUserAggregate);

    return { id: mergedUserAggregate.id };
  }

  // there should be proper logic
  private isLastAdmin(_userId: string): boolean {
    return true;
  }
}
