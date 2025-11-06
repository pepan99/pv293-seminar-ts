import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Account } from '../../core/entities/accounts.entity';
import { IAccountsRepository } from '../../core/repositories/accounts-repository.interface';
import { AccountUpdatedEvent } from '../../core/events/account-updated.event';

export class UpdateAccountCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) { }
}

@CommandHandler(UpdateAccountCommand)
export class UpdateAccountCommandHandler
  implements ICommandHandler<UpdateAccountCommand> {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
    private eventBus: EventBus,
  ) { }

  async execute(command: UpdateAccountCommand): Promise<Account> {
    const updatedAccount = await this.accountsRepository.update(
      {
        id: command.id,
        name: command.name,
        description: command.description,
        icon: command.icon,
        color: command.color,
        userId: command.userId,
      },
    );

    if (!updatedAccount) {
      throw new NotFoundException(`Account with ID ${command.id} not found`);
    }

    // Emit event after successful update
    this.eventBus.publish(
      new AccountUpdatedEvent(command.id, command.userId),
    );

    return updatedAccount;
  }
}
