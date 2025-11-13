import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccountType } from '../../../../shared-kernel/core/types/db';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';
import { Inject } from '@nestjs/common';
import { AccountAggregate } from '../../core/aggregates/account.aggregate';

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
    @Inject('IAccountAggregateRepository')
    private readonly accountsRepository: IAccountAggregateRepository,
  ) {}

  async execute(command: CreateAccountCommand) {
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
    const aggregate = new AccountAggregate();
    aggregate.create(
      accountData.name,
      accountData.accountType,
      accountData.currency,
      userId,
      accountData.description,
      accountData.notes,
      accountData.icon,
      accountData.color,
    );

    const account = await this.accountsRepository.createAccount(aggregate);

    return { id: aggregate.id };
  }
}
