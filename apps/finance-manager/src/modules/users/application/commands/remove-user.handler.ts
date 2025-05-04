import { NotFoundException, Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { IUserAggregateRepository } from "../../core/repositories/user-aggregate-repository.interface";

export class RemoveUserCommand implements ICommand {
    constructor(public readonly id: string) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserCommandHandler implements ICommandHandler<RemoveUserCommand> {
    constructor(
        @Inject("IUsersAggregateRepository")
        private readonly userAggregateRepository: IUserAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: RemoveUserCommand) {
        const userAggregate = await this.userAggregateRepository.findById(command.id);

        if (!userAggregate) {
            throw new NotFoundException(`User with ID ${command.id} not found`);
        }

        const mergedUserAggregate = this.publisher.mergeObjectContext(userAggregate);

        mergedUserAggregate.remove();

        await this.userAggregateRepository.removeUser(mergedUserAggregate);

        return { id: mergedUserAggregate.id };
    }
}
