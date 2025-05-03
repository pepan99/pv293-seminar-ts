import { NotFoundException, Inject } from '@nestjs/common';
import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { IUserAggregateRepository } from '../../core/repositories/user-aggregate-repository.interface';

export class ChangePasswordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
    public readonly confirmPassword: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    @Inject('IUsersAggregateRepository')
    private readonly userAggregateRepository: IUserAggregateRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ChangePasswordCommand) {
    const userAggregate = await this.userAggregateRepository.findById(
      command.userId,
    );

    if (!userAggregate) {
      throw new NotFoundException(`User with ID ${command.userId} not found`);
    }

    const mergedUserAggregate =
      this.publisher.mergeObjectContext(userAggregate);

    await mergedUserAggregate.changePassword(
      command.currentPassword,
      command.newPassword,
    );

    await this.userAggregateRepository.updatePassword(mergedUserAggregate);

    return { success: true };
  }
}
