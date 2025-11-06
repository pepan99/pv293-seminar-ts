import { Inject } from '@nestjs/common';
import { Account } from '../../core/entities/accounts.entity';
import { CreateAccountCommand as CreateAccountDto } from '../../core/commands/account-commands';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class CreateAccountCommand implements ICommand {
  constructor(
    public readonly dto: CreateAccountDto,
    public readonly userId: string,
  ) {}
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(command: CreateAccountCommand): Promise<Account> {
    return this.accountsRepository.create(command.dto, command.userId);
  }
}
