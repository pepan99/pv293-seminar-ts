import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccountsRepository } from '../../infrastructure/repositories/accounts.repository';
import { NotFoundException } from '@nestjs/common';
import { AccountRemovedEvent } from '../../core/events/account-removed.event';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';

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
    private readonly accountsRepository: AccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: RemoveAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const { id, userId } = command;

    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    await this.accountsRepository.remove(id, userId);

    this.eventBus.publish(new AccountRemovedEvent(id, userId));

    return { id, success: true };
  }
}
