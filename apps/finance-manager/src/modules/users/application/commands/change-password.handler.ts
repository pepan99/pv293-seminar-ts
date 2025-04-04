import { NotFoundException } from '@nestjs/common';
import { ChangePasswordDto } from '../../api/dto/zod-dtos';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserAggregateRepository } from '../../infrastructure/repositories/users-aggregate.repository';

export class ChangePasswordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly changePasswordDto: ChangePasswordDto,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(private userAggregateRepository: UserAggregateRepository) {}

  async execute(command: ChangePasswordCommand): Promise<{ success: boolean }> {
    const userAggregate = await this.userAggregateRepository.findById(
      command.userId,
    );

    if (!userAggregate) {
      throw new NotFoundException(`User with ID ${command.userId} not found`);
    }

    await userAggregate.changePassword(
      command.changePasswordDto.currentPassword,
      command.changePasswordDto.newPassword,
    );

    await this.userAggregateRepository.updatePassword(userAggregate);

    return { success: true };
  }
}
