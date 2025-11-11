import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { Account } from '../../core/entities/accounts.entity';
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
    private readonly accountsRepository: IAccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateAccountCommand): Promise<Account> {
    const existingAccount = await this.accountsRepository.findOne(
      command.id,
      command.userId,
    );
    if (!existingAccount) {
      throw new BadRequestException('Account not found');
    }

    const updatedData = {
      name: command.name,
      description: command.description,
      icon: command.icon,
      color: command.color,
    };

    const updatedAccount = await this.accountsRepository.update(
      command.id,
      updatedData,
      command.userId,
    );

    if (!updatedAccount) {
      throw new BadRequestException('Failed to update account');
    }

    this.eventBus.publish('AccountUpdatedEvent', {
      id: updatedAccount.id,
      userId: command.userId,
      name: updatedAccount.name,
      accountType: updatedAccount.accountType,
      currency: updatedAccount.currency,
      description: updatedAccount.description,
      icon: updatedAccount.icon,
      color: updatedAccount.color,
    });

    return updatedAccount;
  }
}
