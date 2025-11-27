import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IAccountsRepository } from "../../core/repositories/accounts-repository.interface";
import { UpdateableAccounts } from "../../core/entities/accounts.entity";
import { AccountUpdatedEvent } from "../../core/events/account-updated.event";

export class UpdateAccountCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: UpdateableAccounts,
  ) {}
}

@CommandHandler(UpdateAccountCommand)
export class UpdateAccountCommandHandler
  implements ICommandHandler<UpdateAccountCommand>
{
  constructor(
    @Inject("IAccountsRepository")
    private readonly accountsRepository: IAccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateAccountCommand) {
    const account = await this.accountsRepository.update(
      command.id,
      command.data,
      command.userId,
    );

    if (!account) {
      throw new NotFoundException(`Account with id ${command.id} not found`);
    }

    this.eventBus.publish(
      new AccountUpdatedEvent(
        command.id,
        command.userId,
        command.data as Record<string, unknown>,
      ),
    );

    return { id: account.id };
  }
}
