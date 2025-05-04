import { NotFoundException, Inject } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { IUserAggregateRepository } from "../../core/repositories/user-aggregate-repository.interface";

export class UpdateUserCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly email?: string,
        public readonly name?: string,
    ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(
        @Inject("IUsersAggregateRepository")
        private readonly userAggregateRepository: IUserAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: UpdateUserCommand) {
        const userAggregate = await this.userAggregateRepository.findById(command.id);

        if (!userAggregate) {
            throw new NotFoundException(`User with ID ${command.id} not found`);
        }

        const mergedUserAggregate = this.publisher.mergeObjectContext(userAggregate);

        mergedUserAggregate.update({
            email: command.email,
            name: command.name,
        });

        await this.userAggregateRepository.updateUser(mergedUserAggregate);

        return { id: mergedUserAggregate.id };
    }
}
