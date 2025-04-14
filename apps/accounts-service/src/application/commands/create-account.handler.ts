import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { AccountAggregateRepository } from "../../infrastructure/database/repositories/accounts-aggregate.repository";
import { AccountType } from "../../../shared-kernel/core/types/db";
import { AccountAggregate } from "../../core/aggregates/account.aggregate";
import { CommandSucceededWithId } from "../../../shared-kernel/core/types/return-types";

export class CreateAccountCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly accountType: AccountType,
    public readonly currency: string,
    public readonly userId: string,
    public readonly description?: string,
    public readonly notes?: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(
    private readonly accountAggregateRepository: AccountAggregateRepository,
  ) {}

  async execute(
    command: CreateAccountCommand,
  ): Promise<CommandSucceededWithId> {
    const { name, accountType, currency, userId, description, icon, color } =
      command;

    const accountAggregate = new AccountAggregate();
    accountAggregate.create(
      name,
      accountType,
      currency,
      userId,
      description,
      0, // initial balance
      icon,
      color,
    );

    await this.accountAggregateRepository.createAccount(accountAggregate);

    return {
      id: accountAggregate.id,
    };
  }
}
