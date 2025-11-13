import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';
import { AccountAggregateRepository } from '../../infrastructure/repositories/accounts-aggregate.repository';

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

    // Load aggregate from repository
    const accountAggregate =
      await this.accountAggregateRepository.findById(id, userId);

    if (!accountAggregate) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    // Apply domain logic
    accountAggregate.remove();

    // Persist through repository
    await this.accountAggregateRepository.removeAccount(accountAggregate);

    return { id };
  }
}
