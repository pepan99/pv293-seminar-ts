import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccountType } from '../../../../shared-kernel/core/types/db';
import { IAccountsAggregateRepository } from '../../core/repositories/accounts-aggregate-repository.interface';
import { Inject } from '@nestjs/common';
import { AccountAggregate } from '../../core/aggregates/accounts.aggregate';

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
    private readonly accountsAggregateRepository: IAccountsAggregateRepository,
    private publisher: EventPublisher,
  ) {}

  async execute(command: CreateAccountCommand) {
    const existingAccount = await this.accountsAggregateRepository.findByName(
      command.name,
      command.userId,
    );
    if (existingAccount) {
      throw new Error(
        'Account with the same name already exists for this user',
      );
    }
    const accountAggregate = this.publisher.mergeObjectContext(
      new AccountAggregate(),
    );

    accountAggregate.create(
      command.name,
      command.userId,
      command.accountType,
      0,
      command.currency,
      command.description,
      command.icon,
      command.color,
    );
    await this.accountsAggregateRepository.createAccount(accountAggregate);

    return { id: accountAggregate.id };
  }
}
