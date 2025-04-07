import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { AccountsRepository } from '../../infrastructure/repositories/accounts.repository';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccountUpdatedEvent } from '../../core/events/account-updated.event';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';

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
    private readonly accountsRepository: AccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: UpdateAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const { id, userId, name, description, icon, color } = command;

    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
    };

    const updatedAccount = await this.accountsRepository.update(
      id,
      updateData,
      userId,
    );

    if (!updatedAccount) {
      throw new InternalServerErrorException(
        'Error updating account with ID ' + id,
      );
    }

    this.eventBus.publish(
      new AccountUpdatedEvent(id, userId, name, account.accountType),
    );

    return { id: id };
  }
}
