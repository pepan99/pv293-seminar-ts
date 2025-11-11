import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { Account } from '../../core/entities/accounts.entity';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { AccountType } from '../../api/dtos/accounts-zod.dtos';

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
    public readonly initialBalance?: number,
  ) {}
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(
    private readonly accountsRepository: IAccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateAccountCommand): Promise<Account> {
    const existingAccount = await this.accountsRepository.findOne(
      command.name,
      command.userId,
    );
    if (existingAccount) {
      throw new BadRequestException(
        'Account with the same name and type already exists',
      );
    }

    const accountData = {
      name: command.name,
      accountType: command.accountType,
      currency: command.currency,
      description: command.description,
      notes: command.notes,
      icon: command.icon,
      color: command.color,
      initialBalance: 0,
    };

    const createdAccount = await this.accountsRepository.create(
      accountData,
      command.userId,
    );

    this.eventBus.publish('AccountCreatedEvent', {
      ...accountData,
      userId: command.userId,
    });

    return createdAccount;
  }
}
