import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';
import { IAccountAggregateRepository } from '../../core/repositories/account-aggregate-repository.interface';

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
    @Inject('IAccountAggregateRepository')
    private readonly accountsRepository: IAccountAggregateRepository,
  ) {}

  async execute(
    command: UpdateAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const { id, userId, name, description, icon, color } = command;

    const account = await this.accountsRepository.findById(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
    };

    account.update(updateData);

    return { id: account.id };
  }
}
