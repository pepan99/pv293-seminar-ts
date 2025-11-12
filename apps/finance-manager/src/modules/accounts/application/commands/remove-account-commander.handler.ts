import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
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
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute(command: RemoveAccountCommand) {
    return await this.accountsRepository.remove(command.id, command.userId);
  }
}
