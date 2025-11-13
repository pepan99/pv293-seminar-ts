import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';

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
    @Inject('IAccountAggregateRepository')
    private readonly accountsRepository: IAccountAggregateRepository,
  ) {}

  async execute(
    command: RemoveAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const { id, userId } = command;

    const account = await this.accountsRepository.findById(id, userId);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    await this.accountsRepository.removeAccount(account);
    return { id };
  }
}
