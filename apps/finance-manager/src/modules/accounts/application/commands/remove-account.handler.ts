import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IAccountsAggregateRepository } from "../../core/repositories/accounts-aggregate-repository.interface";
import { CommandSucceededWithId } from "../../../shared-kernel/core/types/return-types";

export class RemoveAccountCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly userId: string,
    ) {}
}

@CommandHandler(RemoveAccountCommand)
export class RemoveAccountCommandHandler implements ICommandHandler<RemoveAccountCommand> {
    constructor(
        @Inject("IAccountsAggregateRepository")
        private readonly accountAggregateRepository: IAccountsAggregateRepository,
    ) {}

    async execute(command: RemoveAccountCommand): Promise<CommandSucceededWithId> {
        const { id, userId } = command;

        const accountAggregate = await this.accountAggregateRepository.findById(id, userId);

        if (!accountAggregate) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }

        accountAggregate.remove();

        await this.accountAggregateRepository.removeAccount(accountAggregate);

        return { id };
    }
}
