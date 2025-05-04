import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccountCreatedEvent } from '../../core/events/account-created.event';
import { SelectableAccounts } from '../../core/entities/accounts.entity';
import { AccountType } from '../../../../shared-kernel/core/types/db';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { Inject } from '@nestjs/common';

export class CreateAccountCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly accountType: AccountType,
    public readonly currency: string,
    public readonly userId: string,
    public readonly description?: string,
    public readonly notes?: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateAccountCommand): Promise<SelectableAccounts> {
    const {
      userId,
      name,
      accountType,
      currency,
      description,
      notes,
      icon,
      color,
    } = command;

    const accountData = {
      name,
      accountType,
      currency,
      ...(description && { description }),
      ...(notes && { notes }),
      ...(icon && { icon }),
      ...(color && { color }),
    };

    const account = await this.accountsRepository.create(accountData, userId);

    this.eventBus.publish(new AccountCreatedEvent(account.id, userId));

    return account;
  }
}
