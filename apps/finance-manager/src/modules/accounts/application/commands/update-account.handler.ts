import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { AccountAggregateRepository } from '../../infrastructure/repositories/accounts-aggregate.repository';
import { NotFoundException } from '@nestjs/common';
import { CommandSucceededWithId } from '../../../shared-kernel/core/types/return-types';

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
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(
    command: UpdateAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const { id, userId, name, description, icon, color } = command;

    const accountAggregate = await this.accountAggregateRepository.findById(
      id,
      userId,
    );

    if (!accountAggregate) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    accountAggregate.update({
      name,
      description,
      icon,
      color,
    });

    await this.accountAggregateRepository.updateAccount(accountAggregate);

    return { id };
  }
}
