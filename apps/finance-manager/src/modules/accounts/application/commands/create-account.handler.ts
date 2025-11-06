import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { AccountType } from '../../core/commands/account-commands';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { Account } from '../../core/entities/accounts.entity';
import { AccountCreatedEvent } from '../../core/events/account-created.event';

export class CreateAccountCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly currency: string,
    public readonly notes: string | undefined,
    public readonly icon: string | undefined,
    public readonly color: string | undefined,
    public readonly accountType: AccountType,
  ) { }
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand> {
  constructor(
    @Inject('IAccountsRepository')
    private accountsRepository: IAccountsRepository,
    private eventBus: EventBus,
  ) { }

  async execute(command: CreateAccountCommand): Promise<Account> {
    const account = await this.accountsRepository.create(command);

    // Emit event after successful creation
    this.eventBus.publish(
      new AccountCreatedEvent(
        account.id,
        command.userId,
        command.name,
        command.accountType,
      ),
    );

    return account;
  }
}
