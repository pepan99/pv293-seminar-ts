import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { AccountRemovedEvent } from '../../core/events/account-removed.event';

export class RemoveAccountCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(RemoveAccountCommand)
export class RemoveAccountCommandHandler
  implements ICommandHandler<RemoveAccountCommand> {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: RemoveAccountCommand): Promise<boolean> {
    try {
      const result = await this.accountsRepository.remove(
        command.id,
        command.userId,
      );

      if (!result) {
        throw new NotFoundException(`Account with ID ${command.id} not found`);
      }

      // Emit event after successful removal
      this.eventBus.publish(
        new AccountRemovedEvent(command.id, command.userId),
      );

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Rethrow the "Cannot delete account with transactions" error
      throw error;
    }
  }
}
