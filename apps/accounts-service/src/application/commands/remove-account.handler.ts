import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IAccountsRepository } from "../../core/repositories/accounts-repository.interface";
import { AccountRemovedEvent } from "../../core/events/account-removed.event";

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
    @Inject("IAccountsRepository")
    private readonly accountsRepository: IAccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RemoveAccountCommand) {
    const result = await this.accountsRepository.remove(
      command.id,
      command.userId,
    );

    if (!result) {
      throw new NotFoundException(`Account with id ${command.id} not found`);
    }

    this.eventBus.publish(new AccountRemovedEvent(command.id, command.userId));

    return { success: true };
  }
}
