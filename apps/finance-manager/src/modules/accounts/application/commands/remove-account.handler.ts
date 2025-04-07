import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { AccountAggregateRepository } from '../../infrastructure/repositories/accounts-aggregate.repository';
import { NotFoundException } from '@nestjs/common';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';

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
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(
    command: RemoveAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const { id, userId } = command;

    const accountAggregate = await this.accountAggregateRepository.findById(
      id,
      userId,
    );

    if (!accountAggregate) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    accountAggregate.remove();

    await this.accountAggregateRepository.removeAccount(accountAggregate);

    return { id };
  }
}
