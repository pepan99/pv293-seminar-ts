import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { AccountAggregateRepository } from "../../infrastructure/database/repositories/accounts-aggregate.repository";
import { NotFoundException } from "@nestjs/common";
import { CommandSucceededWithId } from "../../../shared-kernel/core/types/return-types";

export class ReconcileAccountCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly actualBalance: number,
        public readonly notes?: string,
    ) {}
}

@CommandHandler(ReconcileAccountCommand)
export class ReconcileAccountCommandHandler implements ICommandHandler<ReconcileAccountCommand> {
    constructor(private readonly accountAggregateRepository: AccountAggregateRepository) {}

    async execute(command: ReconcileAccountCommand): Promise<CommandSucceededWithId> {
        const { id, userId, actualBalance, notes } = command;

        const accountAggregate = await this.accountAggregateRepository.findById(id, userId);

        if (!accountAggregate) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }

        accountAggregate.reconcile(actualBalance, notes);

        await this.accountAggregateRepository.updateAccountBalance(accountAggregate);

        return {
            id,
        };
    }
}
