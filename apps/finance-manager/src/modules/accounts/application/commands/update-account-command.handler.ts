import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';

export class UpdateAccountCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}

@CommandHandler(UpdateAccountCommand)
export class UpdateAccountCommandHandler
  implements ICommandHandler<UpdateAccountCommand>
{
  constructor(
    @Inject('IAccountsRepository')
    private accountsRepository: IAccountsRepository,
  ) {}

  async execute(command: UpdateAccountCommand) {
    return await this.accountsRepository.update(
      command.id,
      command,
      command.userId,
    );
  }
}
