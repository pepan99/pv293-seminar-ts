import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SelectableAccounts } from '../../core/entities/accounts.entity';
import { AccountType } from '../../../../shared-kernel/core/types/db';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { Inject } from '@nestjs/common';
import { AccountAggregateRepository } from '../../infrastructure/repositories/accounts-aggregate.repository';
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
    private readonly accountAggregateRepository: AccountAggregateRepository,
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
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

    // Create aggregate
    const accountAggregate = new AccountAggregate();

    // Generate ID for the new account
    const id = crypto.randomUUID();

    // Apply domain logic
    accountAggregate.create(
      id,
      name,
      accountType,
      currency,
      userId,
      description,
      notes,
      icon,
      color,
    );

    // Persist through repository
    await this.accountAggregateRepository.createAccount(accountAggregate);

    // Return the persisted account for the response
    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new Error('Failed to create account');
    }

    return account;
  }
}
