import {
  CommandHandler,
  EventPublisher,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import {
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccountUpdatedEvent } from '../../core/events/account-updated.event';
import { CommandSucceededWithId } from '../../../../shared-kernel/core/types/return-types';
import { IAccountsAggregateRepository } from '../../core/repositories/accounts-aggregate-repository.interface';

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
    private readonly accountsRepository: IAccountsAggregateRepository,
    private readonly eventBus: EventPublisher,
  ) {}

  async execute(
    command: UpdateAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const existingAccount = await this.accountsRepository.findById(command.id);
    if (!existingAccount || existingAccount.userId !== command.userId) {
      throw new NotFoundException(
        `Account with ID ${command.id} not found for the specified user`,
      );
    }
    const userAggregate = this.eventBus.mergeObjectContext(existingAccount);

    userAggregate.update({
      name: command.name,
      description: command.description,
      icon: command.icon,
      color: command.color,
    });
    await this.accountsRepository.updateAccount(userAggregate);

    return { id: userAggregate.id };
  }
}
