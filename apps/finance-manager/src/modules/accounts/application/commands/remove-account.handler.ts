import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AccountRemovedEvent } from '../../core/events/account-removed.event';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

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
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
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

    return { id };
  }
}
