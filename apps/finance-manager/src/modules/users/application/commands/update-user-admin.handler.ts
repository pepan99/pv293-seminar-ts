import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserAggregateRepository } from '../../infrastructure/repositories/users-aggregate.repository';
import { UpdateUserAdminDto } from '../../api/dto/zod-dtos';
import { UserRole } from '../../../../shared/types/db';

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
  constructor(private userAggregateRepository: UserAggregateRepository) {}

  async execute(command: UpdateUserAdminCommand): Promise<{ id: string }> {
    const userAggregate = await this.userAggregateRepository.findById(
      command.id,
    );

    if (!userAggregate) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    let isLastAdmin = false;
    if (
      userAggregate.roles.includes('admin') &&
      !command.updateUserDto.roles.includes('admin')
    ) {
      isLastAdmin = this.isLastAdmin(command.id);
    }

    if (command.updateUserDto.email || command.updateUserDto.name) {
      userAggregate.update({
        email: command.updateUserDto.email,
        name: command.updateUserDto.name,
      });
    }

    userAggregate.updateRoles(
      command.updateUserDto.roles as UserRole[],
      isLastAdmin,
    );

    await this.userAggregateRepository.updateUserWithRoles(userAggregate);

    return { id: userAggregate.id };
  }

  // there should be proper logic
  private isLastAdmin(_userId: string): boolean {
    return true;
  }
}
