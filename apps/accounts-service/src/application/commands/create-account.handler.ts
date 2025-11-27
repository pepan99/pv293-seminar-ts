import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IAccountsRepository } from "../../core/repositories/accounts-repository.interface";
import { InsertableAccounts } from "../../core/entities/accounts.entity";
import { AccountCreatedEvent } from "../../core/events/account-created.event";

export class CreateAccountCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly data: InsertableAccounts,
  ) {}
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(
    @Inject("IAccountsRepository")
    private readonly accountsRepository: IAccountsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateAccountCommand) {
    const account = await this.accountsRepository.create(
      command.data,
      command.userId,
    );

    this.eventBus.publish(
      new AccountCreatedEvent(
        account.id,
        account.userId,
        account.name,
        account.accountType,
        Number(account.initialBalance),
      ),
    );

    return { id: account.id };
  }
}
