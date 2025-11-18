import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AccountRemovedEvent } from '../../core/events/account-removed.event';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';
import { IAccountsAggregateRepository } from '../../core/repositories/accounts-aggregate-repository.interface';

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
    private readonly accountsRepository: IAccountsAggregateRepository,
    private readonly eventBus: EventPublisher,
  ) {}

  async execute(
    command: RemoveAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const account = await this.accountsRepository.findById(command.id);
    if (!account || account.userId !== command.userId) {
      throw new NotFoundException(
        `Account with ID ${command.id} not found for the specified user`,
      );
    }

    const accountAggregate = this.eventBus.mergeObjectContext(account);
    accountAggregate.remove();

    this.accountsRepository.removeAccount(accountAggregate);

    return { id: accountAggregate.id };
  }
}
