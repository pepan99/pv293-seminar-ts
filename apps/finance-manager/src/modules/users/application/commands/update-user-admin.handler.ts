import { NotFoundException, Inject } from '@nestjs/common';
import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { IUserAggregateRepository } from '../../core/repositories/user-aggregate-repository.interface';
import { UserRole } from '../../../../shared-kernel/core/types/db';

export class UpdateUserAdminCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly roles: UserRole[],
    public readonly email?: string,
    public readonly name?: string,
  ) {}
}

@CommandHandler(UpdateUserAdminCommand)
export class UpdateUserAdminCommandHandler
  implements ICommandHandler<UpdateUserAdminCommand>
{
  constructor(
    @Inject('IUsersAggregateRepository')
    private readonly userAggregateRepository: IUserAggregateRepository,
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
      !command.roles?.includes('admin')
    ) {
      isLastAdmin = this.isLastAdmin(command.id);
    }

    if (command.email || command.name) {
      mergedUserAggregate.update({
        email: command.email,
        name: command.name,
      });
    }

    userAggregate.updateRoles(command.roles, isLastAdmin);

    await this.userAggregateRepository.updateUserWithRoles(mergedUserAggregate);

    return { id: mergedUserAggregate.id };
  }

  // there should be proper logic
  private isLastAdmin(_userId: string): boolean {
    return true;
  }
}
