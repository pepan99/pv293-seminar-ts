import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
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
  implements ICommandHandler<RemoveAccountCommand>
{
  constructor(
    private readonly accountsRepository: IAccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RemoveAccountCommand): Promise<void> {
    const existingAccount = await this.accountsRepository.findOne(
      command.id,
      command.userId,
    );
    if (!existingAccount) {
      throw new BadRequestException('Account not found');
    }

    await this.accountsRepository.remove(command.id, command.userId);

    this.eventBus.publish(new AccountRemovedEvent(command.id, command.userId));
  }
}
