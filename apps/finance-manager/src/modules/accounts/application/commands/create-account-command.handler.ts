import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
}

export class CreateAccountCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly currency: string,
    public readonly accountType: AccountType,
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
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute(command: CreateAccountCommand) {
    return await this.accountsRepository.create(command, command.userId);
  }
}
